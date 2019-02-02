module.exports = {
  projects: [
    {
      displayName: 'integration',
      roots: ['<rootDir>/packages'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
      },
      testRegex: '(/__integration__/.*?(\\.|/)(test))\\.ts$',
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      globals: {
        'ts-jest': {
          diagnostics: false,
        },
      }
    },
    {
      runner: '@fewer/typo/runner',
      displayName: 'typo-integration',
      roots: ['<rootDir>/packages'],
      moduleFileExtensions: ['ts'],
      testRegex: '(/__typo__/.*?(\\.|/)(test))\\.ts$',
    },
  ]
};
