import { AuthenticationError, UserInputError } from 'apollo-server-lambda';
import PropertiesDataSource from 'data-sources/properties';
import properties from './properties';

jest.mock('data-sources/properties');

describe('properties', () => {
  let dataSources;

  beforeEach(() => {
    dataSources = {
      properties: PropertiesDataSource,
    };
  });

  afterEach(jest.clearAllMocks);

  test('successfully retrieves results', async () => {
    dataSources.properties.get.mockResolvedValueOnce([
      { id: 123 },
      { id: 999 },
    ]);

    const data = await properties({}, {}, { dataSources });

    expect(data).toEqual([123, 999]);
  });

  test('fails retrieving unlimited properties without sufficient permissions', () => {
    expect(() => {
      properties(
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
    dataSources.properties.get.mockResolvedValueOnce(ids.map((id) => ({ id })));

    const data = await properties(
      {},
      { limit: null },
      {
        dataSources,
        user: { hasRole: () => true },
      },
    );

    expect(data).toEqual(ids);
  });

  describe('throws validation exception when', () => {
    test('unknown field is provided', () => {
      expect(() => {
        properties(
          {},
          {
            unknown: 'field',
          },
        );
      }).toThrowError(UserInputError);
    });

    test('invalid filter provided', () => {
      expect(() => {
        properties(
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
