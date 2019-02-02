require('ts-node/register');
const buildRunner = require('../src/index').default;
const { pass, fail } = require('create-jest-runner');

module.exports = buildRunner(pass, fail);