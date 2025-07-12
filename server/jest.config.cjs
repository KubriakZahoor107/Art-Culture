/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    // Для всіх .ts/.tsx файлів використовуємо ts-jest і примусово в CommonJS
    '^.+\\.[tj]sx?$': ['ts-jest', { useESM: false }]
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testMatch: ['**/src/tests/**/*.test.ts'],
  moduleNameMapper: {
    // Якщо тест або код імпортує без розширення .js
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  // Щоб Jest не чекав ESM-модулі
  extensionsToTreatAsEsm: [],
};
