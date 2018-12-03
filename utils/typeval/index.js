const { default: Worker } = require('jest-worker');
const ts = require('typescript');
const path = require('path');
const glob = require('fast-glob');

(async () => {
  const paths = await glob(['./packages/**/__typeval__/**/*.ts']);

  const shouldPass = [];
  const shouldFail = [];

  paths.forEach(fileName => {
    if (fileName.includes('/pass/')) {
      shouldPass.push(path.resolve(fileName));
    } else if (fileName.includes('/fail/')) {
      shouldFail.push(path.resolve(fileName));
    } else {
      console.warn(
        'Filename found outside of expected directory. Typeval files must be in either a pass/ or fail/ directory.',
      );
    }
  });

  const worker = new Worker(require.resolve('./Worker'));
  const promises = [];

  shouldPass.forEach(filename => {
    promises.push(worker.check(filename, true));
  });

  shouldFail.forEach(filename => {
    promises.push(worker.check(filename, false));
  });

  await Promise.all(promises);

  console.log('Everything is looking good!');
})();
