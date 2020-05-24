const config = require('./jest.config.js');

process.env.DB_CACHE_DATABASE = 'cache';

module.exports = {
  ...config,
  testRegex: 'itest.js$',
  testPathIgnorePatterns: ['\\.test\\.js'],
  collectCoverage: false,
};
