import path from 'path';
import fs from 'fs';
import ts, { TypeFlags, TypeReference, SymbolFlags } from 'typescript';
import { codeFrameColumns, SourceLocation } from '@babel/code-frame';
import util from 'util';

interface RunnerParams {
  testPath: string;
  config: {
    rootDir: string;
  }
}

interface SpecialReturnType {
  result: any;
}

interface Result {
  start: number;
  end: number;
  test: {
    path: string;
    errorMessage?: string;
    title?: string;
  }
}

const TIMEOUT_SYMBOL = Symbol();

const appendCodeFrame = ({ filePath, errorMessage, location }: { filePath: string, errorMessage: string, location?: SourceLocation }) => {
  if (typeof location === 'undefined') {
    return errorMessage;
  }
  const rawLines = fs.readFileSync(filePath, 'utf8');
  return `${errorMessage}\n${codeFrameColumns(rawLines, location, {
    highlightCode: true,
  })}`;
};

export default function buildRunner(_pass: (result: Result) => SpecialReturnType, _fail: (result: Result) => SpecialReturnType) {
  return async (params: RunnerParams) => {
    const start = Date.now();

    const fail = (errorMessage: string) => {
      return _fail({
        start,
        end: Date.now(),
        test: { path: params.testPath, errorMessage }
      });
    };

    const pass = () => {
      return _pass({
        start,
        end: Date.now(),
        test: { path: params.testPath }
      });
    };

    const configPath = path.resolve(params.config.rootDir, 'tsconfig.json');
    const configContents = fs.readFileSync(configPath).toString();
    const { config, error } = ts.parseConfigFileTextToJson(
      configPath,
      configContents,
    );

    if (error) {
      return fail(error.messageText.toString());
    }

    const settings = ts.convertCompilerOptionsFromJson(
      config['compilerOptions'] || {},
      process.cwd(),
    )

    const options = Object.assign({}, { noEmit: true }, settings.options);
    const program = ts.createProgram([params.testPath], options);
    const emitResult = program.emit();

    const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
    const errorsWithInfo = allDiagnostics.map(diagnostic => {
      if (diagnostic.file && diagnostic.start && diagnostic.length) {
        const {
          line: lineStart,
          character: characterStart,
        } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        const {
          line: lineEnd,
          character: characterEnd,
        } = diagnostic.file.getLineAndCharacterOfPosition(
          diagnostic.start + diagnostic.length,
        );

        const location = {
          start: {
            line: lineStart + 1,
            column: characterStart + 1,
          },
          end: {
            line: lineEnd + 1,
            column: characterEnd + 1,
          },
        };

        const message = ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          '\n',
        );

        return {
          location,
          errorMessage: message,
          filePath: diagnostic.file.fileName,
        };
      } else {
        return {
          errorMessage: `${ts.flattenDiagnosticMessageText(
            diagnostic.messageText,
            '\n',
          )}`,
          filePath: params.testPath,
        };
      }
    });
    const errors = errorsWithInfo.map(appendCodeFrame);

    if (errorsWithInfo.length > 0) {
      return fail(errors.join('\n\n'));
    }

    const sourceFile = program.getSourceFile(params.testPath);

    if (!sourceFile) {
      return fail('could not load source file -- this really should not happen');
    }

    const m = require(params.testPath);

    if (m['setup']) {
      await m['setup']();
    }

    const checker = program.getTypeChecker();
    const allErrors: Promise<string[]>[] = [];

    function visit(node: ts.Node) {
      if (ts.isFunctionDeclaration(node)) {
        const functionName = ts.getNameOfDeclaration(node)!.getText();

        if (!isDeclarationExported(m, functionName) || ['setup', 'teardown'].includes(functionName)) {
          return;
        }

        const type = checker.getReturnTypeOfSignature(checker.getSignatureFromDeclaration(node)!);
        const errors = check('returnValue', checker, type, m[functionName]()).then((errors) => {
          return errors.map(error => {
            return `${functionName}() --> ${error}`;
          });
        })

        allErrors.push(errors);
      }
    }

    ts.forEachChild(sourceFile, visit);

    const flattenedErrors = (await Promise.all(allErrors)).reduce((m, v) => m.concat(v), []);

    if (m['teardown']) {
      await m['teardown']();
    }

    if (flattenedErrors.length > 0) {
      return fail(flattenedErrors.join('\n'));
    }

    return pass();
  };
}

async function flattenPromiseArray<T>(array: Promise<T[]>[]): Promise<T[]> {
  const allResults = await Promise.all(array);
  return flatten(allResults);
}

function flatten<T>(arr: T[][]) {
  return arr.reduce((m, v) => m.concat(v), []);
}

async function check(path: string, checker: ts.TypeChecker, currentType: ts.Type, current: any): Promise<string[]> {
  // const valueToBe = path.length > 0 ? `value at \`${path}\` to be` : 'value to be';
  const valueToBe = `${path} to be a`

  if (currentType.flags & TypeFlags.String) {
    if (typeof current === 'string') {
      return [];
    } else {
      return [`Expected ${valueToBe} string, but got ${util.inspect(current)}`];
    }
  }

  if (currentType.flags & TypeFlags.Number) {
    if (typeof current === 'number') {
      return [];
    } else {
      return [`Expected ${valueToBe} number, but got ${util.inspect(current)}`];
    }
  }

  if (currentType.flags & TypeFlags.Undefined) {
    if (current === undefined) {
      return [];
    } else {
      return [`Expected ${valueToBe} undefined, but got ${util.inspect(current)}`];
    }
  }

  // objects
  if (currentType.flags & TypeFlags.Object && (currentType.flags - TypeFlags.Object == 0)) {
    if (currentType.getSymbol()!.getName() === 'Array') {
      if (current instanceof Array) {
        const withTypeReference = currentType as TypeReference;

        return flattenPromiseArray(current.map(item => {
          return check(path.concat('.[]'), checker, withTypeReference.typeArguments![0], item);
        }));
      } else {
        return [`Expected ${valueToBe} instanceof Array, but got ${util.inspect(current)}`];
      }
    }

    if (currentType.getSymbol()!.getName() === 'Promise') {
      if (current instanceof Promise) {
        let result;

        const timeout = new Promise((resolve) => {
          setTimeout(() => resolve(TIMEOUT_SYMBOL), 10000);
        });

        try {
          result = await Promise.race([current, timeout]);
          if (result === TIMEOUT_SYMBOL) {
            return [`Expected ${valueToBe} promise that resolves within 10 seconds, but promise did not.`];
          };
        } catch(error) {
          return [`Expected ${valueToBe} promise that resolves, but promise rejected.`];
        }

        const withTypeReference = currentType as TypeReference;
        return check(`await(${path})`, checker, withTypeReference.typeArguments![0], result);
      } else {
        return [`Expected ${valueToBe} instanceof Promise, but got ${util.inspect(current)}`];
      }
    }


    // const apparentProps = currentType.getApparentProperties();
    const apparentType = checker.getApparentType(currentType);
    const apparentProps = apparentType.getProperties();

//     const typeNode = checker.typeToTypeNode(currentType)!;
//     const props: [string, Type][] = [];

//     typeNode.forEachChild((c) => {
//       if (ts.isPropertySignature(c) && c.type) {
//         const propType = c.type;
//         if (isUnionTypeNode(propType)) {
//           propType.types
//         }
//         const cType = checker.getTypeFromTypeNode(c.type!);
//         const name = c.name;
// const foo: ts.Type
//         if (ts.isIdentifier(name)) {
//           props.push([name.text, cType])
//           console.log(cType);
//         }
//       }
//     });
    // console.log('path: ', path, 'current: ', current);

    return flattenPromiseArray(apparentProps.map(prop => {
      const propWithType: ts.Symbol & { type: ts.Type } = prop as any;
      const name = propWithType.getName();
      const declarations = prop.getDeclarations();

      if (propWithType.type) {
        const newType = propWithType.type;
        return check(path.concat('.', name), checker, newType, current[name]);
      } else if (declarations && declarations[0]) {
        const newType = checker.getTypeOfSymbolAtLocation(prop, declarations[0]);
        return check(path.concat('.', name), checker, newType, current[name]);
      } else {
        // console.log(prop);
        return Promise.resolve([`Expected ${valueToBe} to have prop '${name}' with type, but no type was found.`]);
      }
    }));

    // return flattenPromiseArray(currentType.getApparentProperties().map(prop => {
    //   const name = prop.getName();
    //   console.log('checking... ' + name);
    //   // const newType = checker.getTypeOfSymbolAtLocation(prop, prop.declarations[0])
    //   const newType = checker.getDeclaredTypeOfSymbol(prop);
    //   return check(path.concat('.', name), checker, newType, current[name]);
    // }));
  }

  // unions
  if (currentType.isUnion()) {
    const potentialErrors = await Promise.all(currentType.types.map((type) => check(path, checker, type, current)));

    const matchedType = potentialErrors.find((errors) => {
      return errors.length === 0;
    });

    if (matchedType) {
      return [];
    } else {
      const names = currentType.types.map(t => {
        const flags = t.getFlags();
        if (flags & TypeFlags.String) {
          return 'string';
        } else if (flags & TypeFlags.Undefined) {
          return 'undefined';
        } else if (flags & TypeFlags.Number) {
          return 'number';
        } else if (flags & TypeFlags.Boolean) {
          return 'boolean';
        } else {
          return t.getSymbol()!.getName();
        }
      })
      return [`Expected ${valueToBe} one of [${names.join(', ')}], but got ${util.inspect(current)}`].concat(potentialErrors.reduce((m, v) => v.concat(m), []).map(s => `   ${s}`));
    }
  }

  return [`Typo doesn't know how to validate type "${util.inspect({...currentType, checker: null})}"`];
}

function isDeclarationExported(m: any, functionName: string): boolean {
  return !!m[functionName];
}