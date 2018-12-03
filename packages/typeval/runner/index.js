const { default: Worker } = require('jest-worker');
const ts = require('typescript');
const { createJestRunner } = require('create-jest-runner');

module.exports = createJestRunner(require.resolve('./runner'));
