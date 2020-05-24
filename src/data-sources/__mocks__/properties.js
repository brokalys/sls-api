export default {
  setCacheControl: jest.fn(),
  get: jest.fn(() => []),
  getCount: jest.fn(() => 10),
  create: jest.fn(() => 123),
};
