export default {
  getById: jest.fn(() => [
    {
      id: 1,
      bounds: [
        [
          { x: 56.992294, y: 24.136619 },
          { x: 56.976394, y: 23.99579 },
          { x: 56.992294, y: 24.136619 },
        ],
      ],
    },
  ]),
  getInPoint: jest.fn(() => [
    {
      id: 1,
      bounds: [
        [
          { x: 56.992294, y: 24.136619 },
          { x: 56.976394, y: 23.99579 },
          { x: 56.992294, y: 24.136619 },
        ],
      ],
    },
  ]),
  findIdByAddress: jest.fn(() => 1),
};
