import { AuthenticationError, UserInputError } from 'apollo-server-lambda';

import Repository from 'lib/repository';
import properties from './properties';

jest.mock('lib/repository');

describe('properties', () => {
  afterEach(jest.clearAllMocks);

  test('successfully retrieves summary.count', async () => {
    Repository.getPropertyCount.mockReturnValue(10);

    const data = await properties();
    const count = data.summary.count();

    expect(count).toEqual(10);
  });

  test('successfully retrieves summary.price', async () => {
    const results = [{ price: 100 }, { price: 200 }];
    Repository.getProperty.mockReturnValue(results);

    const data = await properties();
    const price = data.summary.price();

    expect(price).resolves.toEqual({
      median: 150,
    });
  });

  test('successfully retrieves results', async () => {
    const expectation = [{ id: 123 }, { id: 999 }];
    Repository.getProperty.mockReturnValue(expectation);

    const data = await properties({}, {}, { isAuthenticated: true });
    const results = data.results();

    expect(results).toEqual(expectation);
  });

  test('fails retrieving results if is not authenticated', async () => {
    const data = await properties();

    expect(() => {
      data.results();
    }).toThrowError(AuthenticationError);
  });

  test('matches the schema and does not make unnecessary db calls', async () => {
    const data = await properties();

    expect(data).toEqual({
      results: expect.any(Function),
      summary: {
        count: expect.any(Function),
        price: expect.any(Function),
      },
    });
    expect(Repository.getPropertyCount).not.toBeCalled();
    expect(Repository.getProperty).not.toBeCalled();
  });

  describe('throws validation exception when', () => {
    test('unknown field is provided', () => {
      expect(
        properties(
          {},
          {
            unknown: 'field',
          },
        ),
      ).rejects.toBeInstanceOf(UserInputError);
    });

    test('invalid filter provided', () => {
      expect(
        properties(
          {},
          {
            filters: {
              published_at: { gte: '2018-01-01' },
            },
          },
        ),
      ).rejects.toBeInstanceOf(UserInputError);
    });
  });
});
