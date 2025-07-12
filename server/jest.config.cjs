/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', {
      tsconfig: 'server/tsconfig.json',
      useESM: true
    }]
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testMatch: ['**/src/tests/**/*.test.ts'],
  moduleNameMapper: {
    // Якщо тест або код імпортує без розширення .js
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  // Дати Jest знати, що .ts — це ESM
  extensionsToTreatAsEsm: ['.ts'],
};
