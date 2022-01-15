export default {
  loadMany: jest.fn().mockResolvedValue([]),
  loadByBuildingId: jest.fn(() => ({
    1: [
      {
        building_id: 1,
        price: 123,
      },
    ],
  })),
};
