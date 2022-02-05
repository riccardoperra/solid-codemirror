/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  preset: 'solid-jest/preset/browser',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(spec/.*|(\\.|/)(test|spec))\\.tsx?$',

  'setupFilesAfterEnv': ['./test/setupTests.ts'],

  // Module file extensions for importing
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // insert setupFiles and other config
  // you probably want to test in browser mode:
  // unfortunately, solid cannot detect browser mode here,
  // so we need to manually point it to the right versions:

  globals: {
    'ts-jest': {
      'tsconfig': 'tsconfig.json',
      isolatedModules: true,
      'babelConfig': {
        'presets': [
          'babel-preset-solid',
          '@babel/preset-env',
          "@babel/preset-typescript"
        ]
      }
    }
  }
};
