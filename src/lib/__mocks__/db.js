export default {
  connect: jest.fn(),
  getClient: jest.fn(() => ({
    escape: jest.fn(),
  })),
  query: jest.fn(() => []),
  end: jest.fn(),
};
