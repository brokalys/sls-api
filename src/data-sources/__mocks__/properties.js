export default {
  get: jest.fn(() => []),
  getCount: jest.fn(() => 10),
  create: jest.fn(() => 123),
  getInBuildings: jest.fn(() => ({
    1: [
      {
        building_id: 1,
        price: 123,
      },
    ],
  })),
};
