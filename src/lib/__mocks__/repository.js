export default {
  unsubscribePinger: jest.fn(),
  unsubscribeAllPingers: jest.fn(),
  confirmPinger: jest.fn(),
  getPingers: jest.fn(() => []),
  getPinger: jest.fn(() => ({
    id: 1,
    unsubscribe_key: 'key',
  })),
  createPinger: jest.fn(() => 1),
};
