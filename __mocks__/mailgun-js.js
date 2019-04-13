export const send = jest.fn();

export default jest.fn(() => ({
  messages: jest.fn(() => ({
    send,
  })),
}));
