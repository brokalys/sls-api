export default {
  get: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockResolvedValue([123]),
  loadByBuildingId: jest.fn(() => ({
    1: [
      {
        building_id: 1,
        price: 123,
      },
    ],
  })),
  loadMany: jest.fn().mockResolvedValue([]),
};
