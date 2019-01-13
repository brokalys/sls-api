export default {
  run: jest.fn((key, params, callback) => callback(params)),
  get: jest.fn(),
  set: jest.fn(),
};
