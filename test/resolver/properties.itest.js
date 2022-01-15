import { createTestClient } from 'apollo-server-testing';
import { server } from 'handler';
import { authenticateAs } from 'helpers';
import db from 'db-config';
import makeProperty from '../db/fixtures/property';

const { query } = createTestClient(server);

describe('Query: properties', () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterEach(jest.clearAllMocks);

  test('successfully retrieves property summary.count data', async () => {
    const response = await query({
      query: `
       query ($filter: PropertyFilter) {
          properties(filter: $filter) {
            summary {
              count
            }
          }
        }
      `,
      variables: {
        filter: {
          source: { eq: 'ss.lv' },
          type: { eq: 'rent' },
        },
      },
    });

    expect(response).toMatchSnapshot();
  });

  test('successfully retrieves all the property fields', async () => {
    authenticateAs('slsCrawler', server);

    const response = await query({
      query: `
       query ($filter: PropertyFilter) {
          properties(filter: $filter) {
            results {
              id
              url
              category
              type
              rent_type
              content
              images
              price
              calc_price_per_sqm
              rooms
              area
              floor
              lat
              lng
              published_at
              foreign_id
            }
            summary {
              count
              price {
                count
                min
                max
                mean
                median
                mode
                standardDev
              }
            }
          }
        }
      `,
      variables: {
        filter: {
          source: { eq: 'ss.lv' },
          type: { eq: 'rent' },
        },
      },
    });

    expect(response).toMatchSnapshot();
  });

  test('returns 0 count when no properties are found', async () => {
    const response = await query({
      query: `
       query ($filter: PropertyFilter) {
          properties(filter: $filter) {
            summary {
              count
            }
          }
        }
      `,
      variables: {
        filter: { price: { gt: 9999999 } },
      },
    });

    expect(response).toMatchSnapshot();
  });

  test('successfully retrieves property summary.price data', async () => {
    const response = await query({
      query: `
       query ($filter: PropertyFilter) {
          properties(filter: $filter) {
            summary {
              price {
                count
                min
                max
                mean
                median
                mode
                standardDev
              }
            }
          }
        }
      `,
      variables: {
        filter: {
          source: { eq: 'ss.lv' },
          type: { eq: 'rent' },
        },
      },
    });

    expect(response).toMatchSnapshot();
  });

  test('successfully retrieves truncated property summary.price data', async () => {
    const response = await query({
      query: `
       query ($filter: PropertyFilter) {
          properties(filter: $filter) {
            summary {
              price(discard: 0.5) {
                count
                min
                max
                mean
                median
                mode
                standardDev
              }
            }
          }
        }
      `,
      variables: {
        filter: { source: { eq: 'ss.lv' } },
      },
    });

    expect(response).toMatchSnapshot();
  });

  test('successfully retrieves results', async () => {
    authenticateAs('slsDataExtraction', server);

    const response = await query({
      query: `
       query ($filter: PropertyFilter) {
          properties(filter: $filter) {
            results {
              id
            }
          }
        }
      `,
      variables: {
        filter: { category: { eq: 'apartment' } },
      },
    });

    expect(response).toMatchSnapshot();
  });

  test.each([
    { filter: { published_at: { gte: 'value' } } }, // simply wrong value
    { filter: { published_at: '2019-01-01' } }, // wrong filter expression
  ])(
    'throws a validation error when trying to retrieve summary.count',
    async (input) => {
      const response = await query({
        query: `
        query GetCount($filter: PropertyFilter) {
          properties(filter: $filter) {
            summary {
              count
            }
          }
        }
      `,
        variables: input,
      });

      expect(response.errors).toHaveLength(1);
    },
  );

  test('throws an authentication error if trying to retrieve results without authorizing', async () => {
    const response = await query({
      query: `
        {
          properties {
            results {
              id
            }
          }
        }
      `,
    });

    expect(response.errors).toEqual([
      expect.objectContaining({
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      }),
    ]);
  });

  test('should not be able to query unlimited results with public permissions', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        {
          properties(limit: null) {
            results {
              id
            }
          }
        }
      `,
    });

    expect(response.errors).toEqual([
      expect.objectContaining({
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      }),
    ]);
  });

  test('should limit the results to 30 if no limit provided', async () => {
    await db('properties').insert(new Array(100).fill(makeProperty()));
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        {
          properties {
            results {
              id
            }
          }
        }
      `,
    });

    expect(response.data.properties.results.length).toBe(20);
  });

  test.each(['url', 'content', 'images', 'lat', 'lng', 'foreign_id'])(
    'throws an authentication error if trying to retrieve specific field %j without permissions',
    async (field) => {
      authenticateAs('mapApp', server);

      const response = await query({
        query: `
        {
          properties {
            results {
              ${field}
            }
          }
        }
      `,
      });

      expect(response.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            extensions: {
              code: 'UNAUTHENTICATED',
            },
          }),
        ]),
      );
    },
  );
});
