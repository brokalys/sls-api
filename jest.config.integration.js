const config = require('./jest.config.js');

module.exports = {
  ...config,
  testRegex: 'itest.js$',
  testPathIgnorePatterns: ['\\.test\\.js'],
  collectCoverage: false,
};
