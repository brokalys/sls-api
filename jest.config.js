module.exports = {
  transform: {
    '\\.(gql|graphql)$': 'jest-transform-graphql',
    '.*': 'babel-jest',
  },
  clearMocks: true,
  testEnvironment: 'node',
};
