module.exports = {
  setupFiles: ['./__setups__/date.js'],
  transform: {
    '\\.(gql|graphql)$': 'jest-transform-graphql',
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
  clearMocks: true,
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.itest.js',
  ],
  testPathIgnorePatterns: ['\\.itest\\.js'],
  modulePaths: ['<rootDir>/src/', '<rootDir>/data/'],
};
