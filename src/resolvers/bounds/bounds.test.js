import { AuthenticationError, UserInputError } from 'apollo-server-lambda';
import BuildingsDataSource from 'data-sources/buildings';
import resolver from './bounds';

jest.mock('data-sources/buildings');

describe('bounds', () => {
  let dataSources;

  beforeEach(() => {
    dataSources = {
      buildings: BuildingsDataSource,
    };
  });

  afterEach(jest.clearAllMocks);

  test('successfully retrieves results', async () => {
    const buildings = [{ id: 123 }, { id: 999 }];
    dataSources.buildings.getInBounds.mockResolvedValueOnce(buildings);

    const data = await resolver(
      {},
      {
        bounds:
          '56.944756215513316 24.09404948877113, 56.9404253703127 24.09404948877113, 56.9404253703127 24.086952363717725, 56.944756215513316 24.086952363717725, 56.944756215513316 24.09404948877113',
      },
    );

    expect(data).toEqual({
      bounds:
        '56.944756215513316 24.09404948877113, 56.9404253703127 24.09404948877113, 56.9404253703127 24.086952363717725, 56.944756215513316 24.086952363717725, 56.944756215513316 24.09404948877113',
      buildings: expect.any(Function),
    });
    expect(await data.buildings({}, { dataSources })).toEqual(buildings);
  });

  describe('throws validation exception when', () => {
    test('unknown field is provided', () => {
      expect(() => {
        resolver(
          {},
          {
            unknown: 'field',
          },
        );
      }).toThrowError(UserInputError);
    });

    test('invalid filter provided', () => {
      expect(() => {
        resolver(
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
