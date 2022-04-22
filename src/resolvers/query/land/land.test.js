import { UserInputError } from 'apollo-server-lambda';
import landDataSource from 'data-sources/land';
import land from './land';

jest.mock('data-sources/land');

describe('land', () => {
  let dataSources;

  beforeEach(() => {
    dataSources = {
      land: landDataSource,
    };
  });

  afterEach(jest.clearAllMocks);

  test('successfully retrieves basic data', async () => {
    const data = await land({}, { id: 1 }, { dataSources });

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
        land({}, {});
      }).toThrowError(UserInputError);
    });

    test('invalid id data-type provided', () => {
      expect(() => {
        land(
          {},
          {
            id: 'wrong',
          },
        );
      }).toThrowError(UserInputError);
    });
  });
});
