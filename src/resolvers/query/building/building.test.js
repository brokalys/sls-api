import { UserInputError } from 'apollo-server-lambda';
import BuildingsDataSource from 'data-sources/buildings';
import building from './building';

jest.mock('data-sources/buildings');

describe('building', () => {
  let dataSources;

  beforeEach(() => {
    dataSources = {
      buildings: BuildingsDataSource,
    };
  });

  afterEach(jest.clearAllMocks);

  test('successfully retrieves basic data', async () => {
    const data = await building({}, { id: 1 }, { dataSources });

    expect(data).toEqual([
      {
        id: 1,
        bounds: expect.any(Array),
      },
    ]);
  });

  describe('throws validation exception when', () => {
    test('no bounds provided', () => {
      expect(() => {
        building({}, {});
      }).toThrowError(UserInputError);
    });

    test('invalid id data-type provided', () => {
      expect(() => {
        building(
          {},
          {
            id: 'wrong',
          },
        );
      }).toThrowError(UserInputError);
    });
  });
});
