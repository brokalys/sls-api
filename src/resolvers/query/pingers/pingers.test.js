import { AuthenticationError, UserInputError } from 'apollo-server-lambda';
import PingersDataSource from 'data-sources/pingers';
import pingers from './pingers';

jest.mock('data-sources/pingers');

describe('pingers', () => {
  let dataSources;

  beforeEach(() => {
    dataSources = {
      pingers: PingersDataSource,
    };
  });

  afterEach(jest.clearAllMocks);

  test('successfully retrieves results', async () => {
    dataSources.pingers.get.mockResolvedValueOnce([
      { id_hash: 123 },
      { id_hash: 999 },
    ]);

    const data = await pingers(
      {},
      { id: 'test-123', unsubscribe_key: 'key-123' },
      { dataSources, user: { hasRole: () => true } },
    );

    expect(data).toEqual([123, 999]);
  });

  test('fails retrieving without sufficient permissions', () => {
    expect(() => {
      pingers(
        {},
        { id: 'test-123', unsubscribe_key: 'key-123' },
        {
          dataSources,
          user: { hasRole: () => false },
        },
      );
    }).toThrowError(AuthenticationError);
  });

  describe('throws validation exception when', () => {
    test('unknown field is provided', () => {
      expect(() => {
        pingers(
          {},
          {
            unknown: 'field',
          },
        );
      }).toThrowError(UserInputError);
    });

    test('missing id', () => {
      expect(() => {
        pingers(
          {},
          {
            unsubscribe_key: 'test-123',
          },
        );
      }).toThrowError(UserInputError);
    });

    test('missing unsubscribe_key', () => {
      expect(() => {
        pingers(
          {},
          {
            id: 'test-123',
          },
        );
      }).toThrowError(UserInputError);
    });
  });
});
