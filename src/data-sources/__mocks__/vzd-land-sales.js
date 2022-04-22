export default {
  loadByLandCadastralDesignation: jest.fn(() => ({
    1: [
      {
        id: 1,
        price: 123,
      },
    ],
  })),
  get: jest.fn(() => ({
    1: [
      {
        id: 1,
        price: 123,
      },
    ],
  })),
};
