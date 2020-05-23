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

  test('successfully retrieves summary.count', async () => {
    const data = await properties({}, {}, { dataSources });
    const count = data.summary.count();

    expect(count).toEqual(10);
  });

  test('successfully retrieves summary.price', async () => {
    const results = [{ price: 100 }, { price: 200 }];
    dataSources.properties.get.mockReturnValueOnce(results);

    const data = await properties({}, {}, { dataSources });
    const price = data.summary.price();

    expect(price).resolves.toEqual({
      min: 100,
      max: 200,
      mean: 150,
      median: 150,
      mode: 100,
      standardDev: 50,
    });
  });

  test('returns `null` if no data is found for summary.price', async () => {
    const results = [];
    dataSources.properties.get.mockReturnValueOnce(results);

    const data = await properties({}, {}, { dataSources });
    const price = data.summary.price();

    expect(price).resolves.toEqual({
      min: null,
      max: null,
      mean: null,
      median: null,
      mode: null,
      standardDev: null,
    });
  });

  test('successfully retrieves results', async () => {
    const expectation = [{ id: 123 }, { id: 999 }];
    dataSources.properties.get.mockReturnValueOnce(expectation);

    const data = await properties(
      {},
      {},
      { isAuthenticated: true, dataSources },
    );
    const results = data.results();

    expect(results).toEqual(expectation);
  });

  test('retrieves only selected fields from DB', async () => {
    const expectation = [{ id: 123 }, { id: 999 }];
    dataSources.properties.get.mockReturnValueOnce(expectation);

    const data = await properties(
      {},
      {},
      { isAuthenticated: true, dataSources },
      {
        operation: {
          selectionSet: {
            selections: [
              {
                selectionSet: {
                  selections: [
                    {
                      selectionSet: {
                        selections: [
                          {
                            name: {
                              value: 'id',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    );
    const results = data.results();

    expect(results).toEqual(expectation);
    expect(dataSources.properties.get).toBeCalledWith({}, 20, ['id']);
  });

  test('fails retrieving results if is not authenticated', async () => {
    const data = await properties();

    expect(() => {
      data.results();
    }).toThrowError(AuthenticationError);
  });

  test('matches the schema and does not make unnecessary db calls', async () => {
    const data = await properties({}, {}, { dataSources });

    expect(data).toEqual({
      results: expect.any(Function),
      summary: {
        count: expect.any(Function),
        price: expect.any(Function),
      },
    });
    expect(dataSources.properties.getCount).not.toBeCalled();
    expect(dataSources.properties.get).not.toBeCalled();
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
