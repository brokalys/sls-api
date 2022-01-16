export default {
  loadByBuildingId: jest.fn(() => ({
    1: [
      {
        building_id: 1,
        price: 123,
      },
    ],
  })),
};
