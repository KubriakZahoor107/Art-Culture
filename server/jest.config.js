export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)$': '$1',
  },
};
