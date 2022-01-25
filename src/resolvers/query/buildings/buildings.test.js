import { AuthenticationError, UserInputError } from 'apollo-server-lambda';
import BuildingsDataSource from 'data-sources/buildings';
import buildings from './buildings';

jest.mock('data-sources/buildings');

describe('buildings', () => {
  let dataSources;

  beforeEach(() => {
    dataSources = {
      buildings: BuildingsDataSource,
    };
  });

  afterEach(jest.clearAllMocks);

  test('successfully retrieves limited data', async () => {
    const data = await buildings({}, {}, { dataSources });

    expect(data).toEqual([
      {
        id: 1,
        bounds: expect.any(Array),
      },
    ]);
  });

  test('fails retrieving unlimited properties without sufficient permissions', () => {
    expect(() => {
      buildings(
        {},
        { limit: null },
        {
          dataSources,
          user: { hasRole: () => false },
        },
      );
    }).toThrowError(AuthenticationError);
  });

  test('succeeds retrieving unlimited properties with sufficient permissions', async () => {
    const ids = new Array(100).fill('');
    const buildingData = ids.map((id) => ({ id }));
    dataSources.buildings.get.mockResolvedValueOnce(buildingData);

    const data = await buildings(
      {},
      { limit: null },
      {
        dataSources,
        user: { hasRole: () => true },
      },
    );

    expect(data).toEqual(buildingData);
  });

  describe('throws validation exception when', () => {
    test('unknown field is provided', () => {
      expect(() => {
        buildings(
          {},
          {
            unknown: 'field',
          },
        );
      }).toThrowError(UserInputError);
    });

    test('invalid filter provided', () => {
      expect(() => {
        buildings(
          {},
          {
            filters: {
              published_at: { gte: '2018-01-01' },
            },
          },
        );
      }).toThrowError(UserInputError);
    });
  });
});
