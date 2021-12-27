import { UserInputError } from 'apollo-server-lambda';
import BuildingsDataSource from 'data-sources/buildings';
import resolver from './point';

jest.mock('data-sources/buildings');

describe('point', () => {
  let dataSources;

  beforeEach(() => {
    dataSources = {
      buildings: BuildingsDataSource,
    };
  });

  afterEach(jest.clearAllMocks);

  test('successfully retrieves results', async () => {
    const buildings = [{ id: 123 }];
    dataSources.buildings.getInPoint.mockResolvedValueOnce(buildings);

    const data = await resolver(
      {},
      {
        lat: 56.942285,
        lng: 24.088706,
      },
    );

    expect(data).toEqual({
      buildings: expect.any(Function),
    });
    expect(await data.buildings({}, { dataSources })).toEqual(buildings);
  });

  test('throws validation exception when unknown field is provided', () => {
    expect(() => {
      resolver(
        {},
        {
          unknown: 'field',
        },
      );
    }).toThrowError(UserInputError);
  });
});
