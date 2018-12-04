const fs = require('fs');
const path = require('path');
const isEqual = require('lodash/isEqual');
const ts = require('typescript');
const diff = require('jest-diff');
const { pass, fail } = require('create-jest-runner');
const { codeFrameColumns: codeFrame } = require('@babel/code-frame');

const configPath = ts.findConfigFile(
  '../../',
  ts.sys.fileExists,
  'tsconfig.json',
);
const configJson = ts.readConfigFile(configPath, ts.sys.readFile);
const builtConfig = ts.parseJsonConfigFileContent(
  configJson.config,
  ts.sys,
  path.join(__dirname, '..', '..'),
);

const appendCodeFrame = ({ filePath, errorMessage, location }) => {
  if (typeof location === 'undefined') {
    return errorMessage;
  }
  const rawLines = fs.readFileSync(filePath, 'utf8');
  return `${errorMessage}\n${codeFrame(rawLines, location, {
    highlightCode: true,
  })}`;
};

module.exports = ({ testPath, config: jestConfig }) => {
  const start = Date.now();
  const configPath = path.resolve(jestConfig.rootDir, 'tsconfig.json');
  const configContents = fs.readFileSync(configPath).toString();
  const { config, error } = ts.parseConfigFileTextToJson(
    configPath,
    configContents,
  );

  const baseObj = {
    start,
    title: 'tsc',
    test: { path: testPath },
  };

  if (error) {
    return fail({
      ...baseObj,
      end: Date.now(),
      errorMessage: error,
    });
  }

  let shouldPass;
  if (testPath.includes('/pass/')) {
    shouldPass = true;
  } else if (testPath.includes('/fail/')) {
    shouldPass = false;
  } else {
    return fail({
      ...baseObj,
      end: Date.now(),
      errorMessage: 'File should either be in a `pass/` or `fail/` directory.',
    });
  }

  const settings = ts.convertCompilerOptionsFromJson(
    config['compilerOptions'] || {},
    process.cwd(),
  );

  const options = Object.assign({}, { noEmit: true }, settings.options);

  const program = ts.createProgram([testPath], options);

  const emitResult = program.emit();

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  const errorsWithInfo = allDiagnostics.map(diagnostic => {
    if (diagnostic.file) {
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
        filePath: testPath,
      };
    }
  });

  const errorsForSnapshot = errorsWithInfo.map(
    ({ filePath, ...error }) => error,
  );
  const errors = errorsWithInfo.map(appendCodeFrame);

  const end = Date.now();

  if (shouldPass && errors.length === 0) {
    return pass({ ...baseObj, end });
  } else if (!shouldPass && errors.length) {
    try {
      const errorsSnapshot = JSON.parse(
        fs.readFileSync(
          path.join(
            path.dirname(testPath),
            path.basename(testPath, '.ts') + '.errors.json',
          ),
        ),
      );

      if (!isEqual(errorsSnapshot, errorsForSnapshot)) {
        const failure = fail({
          ...baseObj,
          end,
          errorMessage:
            'The snapshot did not match the type errors. Use Jest watch mode and press `e` to update tests.\n' +
            diff(errorsSnapshot, errorsForSnapshot),
        });
        failure.errorsSnapshot = errorsForSnapshot;
        return failure;
      }

      return pass({
        ...baseObj,
        end,
      });
    } catch (e) {
      const failure = fail({
        ...baseObj,
        end,
        errorMessage:
          'No error snapshot found. Use Jest watch mode and press `e` to update tests.',
      });
      failure.errorsSnapshot = errorsForSnapshot;
      return failure;
    }
  } else if (!shouldPass && !errors.length) {
    return fail({
      ...baseObj,
      end,
      errorMessage: 'Expected at least one TypeScript error, but found none.',
    });
  }

  return fail({
    ...baseObj,
    errorMessage: errors.join('\n\n'),
    end,
  });
};
