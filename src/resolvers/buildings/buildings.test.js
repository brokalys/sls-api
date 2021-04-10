import { UserInputError } from 'apollo-server-lambda';
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

  test('successfully retrieves basic data', async () => {
    const data = await buildings({}, { id: 1 }, { dataSources });

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
        buildings({}, {});
      }).toThrowError(UserInputError);
    });

    test('invalid id data-type provided', () => {
      expect(() => {
        buildings(
          {},
          {
            id: 'wrong',
          },
        );
      }).toThrowError(UserInputError);
    });
  });
});
