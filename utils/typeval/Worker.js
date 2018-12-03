const ts = require('typescript');
const path = require('path');

const configPath = ts.findConfigFile('../../', ts.sys.fileExists, 'tsconfig.json');
const configJson = ts.readConfigFile(configPath, ts.sys.readFile);
const builtConfig = ts.parseJsonConfigFileContent(
  configJson.config,
  ts.sys,
  path.join(__dirname, '..', '..'),
);

exports.check = (filename, shouldPass) => {
  const program = ts.createProgram([filename], builtConfig.options);
  const diagnostics = ts.getPreEmitDiagnostics(program);

  if (shouldPass && diagnostics.length) {
    console.log('Uh oh!');
    console.log(
      diagnostics.map(diagnostic => diagnostic.messageText).join('\n'),
    );
    process.exit(1);
  } else if (!shouldPass && !diagnostics.length) {
    console.log('Uh oh!');
    process.exit(1);
  }
};
