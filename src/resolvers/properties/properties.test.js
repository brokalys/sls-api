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

  afterEach(jest.resetAllMocks);

  test('successfully retrieves summary.count', async () => {
    const data = await properties({}, {}, { dataSources });
    const count = data.summary.count();

    expect(count).toEqual(10);
  });

  test('successfully retrieves summary.price', async () => {
    const results = [{ price: 100 }, { price: 200 }];
    dataSources.properties.get.mockResolvedValueOnce(results);

    const data = await properties({}, {}, { dataSources });
    const price = await data.summary.price();

    expect(price).toEqual({
      prices: [100, 200],
    });
  });

  test.each([
    1.1, // too big
    -0.1, // too small

    // wrong datatypes
    'test',
    '',
    null,
    true,
    false,
  ])(
    'throws a validation exception when `discard` is invalid in summary.price: %# - %j',
    async (discard) => {
      const results = [{ price: 100 }, { price: 200 }];
      dataSources.properties.get.mockResolvedValueOnce(results);

      const data = await properties({}, {}, { dataSources });

      expect(data.summary.price({ discard })).rejects.toThrowError(
        UserInputError,
      );
    },
  );

  test('successfully retrieves results', async () => {
    const expectation = [{ id: 123 }, { id: 999 }];
    dataSources.properties.get.mockResolvedValueOnce(expectation);

    const data = await properties(
      {},
      {},
      { isAuthenticated: true, dataSources },
    );
    const results = await data.results();

    expect(results).toEqual(expectation);
  });

  test('retrieves only selected fields from DB', async () => {
    const expectation = [{ id: 123 }, { id: 999 }];
    dataSources.properties.get.mockResolvedValueOnce(expectation);

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
    const results = await data.results();

    expect(results).toEqual(expectation);
    expect(dataSources.properties.get).toBeCalledWith({}, 20, ['id']);
  });

  test('retrieves additional fields if `price_per_sqm` selected, but not `price` and `area`', async () => {
    const expectation = [
      { price: 100, price_per_sqm: 1, area: 100 },
      { price: 200, price_per_sqm: 2, area: null },
      { price: null, price_per_sqm: 3, area: 100 },
      { price: 400, price_per_sqm: 4, area: 100 },
      { price: 500, price_per_sqm: 5, area: null },
      { price: null, price_per_sqm: 6, area: null },
      { price: null, price_per_sqm: null, area: 100 },
    ];
    dataSources.properties.get.mockResolvedValueOnce([
      { price: 100, price_per_sqm: 1, area: 100 },
      { price: 200, price_per_sqm: 2, area: null },
      { price: null, price_per_sqm: 3, area: 100 },
      { price: 400, price_per_sqm: null, area: 100 },
      { price: 500, price_per_sqm: 5, area: null },
      { price: null, price_per_sqm: 6, area: null },
      { price: null, price_per_sqm: null, area: 100 },
    ]);

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
                              value: 'price_per_sqm',
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
    const results = await data.results();

    expect(results).toEqual(expectation);
    expect(dataSources.properties.get).toBeCalledWith({}, 20, [
      'price_per_sqm',
      'price',
      'area',
    ]);
  });

  test('fails retrieving results if is not authenticated', async () => {
    const data = await properties({}, {}, { dataSources });

    expect(data.results()).rejects.toThrowError(AuthenticationError);
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
