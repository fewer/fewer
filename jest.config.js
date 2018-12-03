module.exports = {
  projects: [
    {
      displayName: 'test',
      roots: ['<rootDir>/packages'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
      },
      testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      globals: {
        'ts-jest': {
          diagnostics: false,
        },
      },
    },
    {
      runner: '@fewer/typeval/runner',
      displayName: 'typeval',
      moduleFileExtensions: ['ts'],
      testMatch: ['<rootDir>/**/__typeval__/**/*.ts'],
    },
  ],
  watchPlugins: ['@fewer/typeval/watchPlugin'],
};
