import { createTestClient } from 'apollo-server-testing';
import { server } from 'handler';
import { authenticateAs } from 'helpers';
import db from 'db-config';

const { query } = createTestClient(server);

describe('Resolver: properties - real queries from other services', () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterEach(jest.clearAllMocks);

  describe('crawler', () => {
    test('city24.lv', async () => {
      authenticateAs('slsCrawler', server);

      const response = await query({
        query: `
          query GetExistingClassifieds($foreignIds: [String]) {
            properties(
              filter: {
                source: { eq: "city24.lv" }
                foreign_id: { in: $foreignIds }
              }
              limit: null
            ) {
              results {
                foreign_id
              }
            }
          }
        `,
        variables: {
          foreignIds: ['id111'],
        },
      });

      expect(response).toMatchSnapshot();
    });

    test('inch.lv', async () => {
      authenticateAs('slsCrawler', server);

      const response = await query({
        query: `
          query GetClassifieds(
            $url_0: String!
            $foreign_id_0: String!
            $url_1: String!
            $foreign_id_1: String!
          ) {
            row_0: properties(
              filter: {
                source: { eq: "inch.lv" }
                url: { eq: $url_0 }
                foreign_id: { eq: $foreign_id_0 }
              }
            ) {
              summary {
                count
              }
            }
            row_1: properties(
              filter: {
                source: { eq: "inch.lv" }
                url: { eq: $url_1 }
                foreign_id: { eq: $foreign_id_1 }
              }
            ) {
              summary {
                count
              }
            }
          }
        `,
        variables: {
          url_0: 'https://inch.lv',
          foreign_id_0: '10001',
          url_1: 'https://inch.lv',
          foreign_id_1: '10002',
        },
      });

      expect(response).toMatchSnapshot();
    });

    test('mm.lv', async () => {
      authenticateAs('slsCrawler', server);

      const response = await query({
        query: `
          query GetExistingClassifieds($urls: [String]) {
            properties(
              filter: {
                source: { eq: "mm-lv" }
                url: { in: $urls }
              }
              limit: null
            ) {
              results {
                url
              }
            }
          }
        `,
        variables: {
          urls: ['https://mm.lv'],
        },
      });

      expect(response).toMatchSnapshot();
    });

    test('ss.lv', async () => {
      authenticateAs('slsCrawler', server);

      const response = await query({
        query: `
          query GetExistingClassifieds(
            $source: String!
            $urls: [String!]!
            $created_at: String!
          ) {
            properties(
              filter: {
                source: { eq: $source }
                url: { in: $urls }
                created_at: { gte: $created_at }
              }
              limit: null
            ) {
              results {
                url
              }
            }
          }
        `,
        variables: {
          source: 'ss.lv',
          urls: [
            'https://www.ss.com/msg/lv/real-estate/flats/aizkraukle-and-reg/aiviekstes-pag/aghfx.html',
            'https://www.ss.lv/msg/lv/real-estate/flats/riga/bolderaya/cceeb.html',
          ],
          created_at: '2020-01-01T00:00:00.000Z',
        },
      });

      expect(response).toMatchSnapshot();
    });
  });

  describe('data extraction', () => {
    test('base-data', async () => {
      authenticateAs('slsDataExtraction', server);

      const response = await query({
        query: `
          query Extract(
            $created_at_start: String!
            $created_at_end: String!
            $type: String!
          ) {
            properties(
              filter: {
                created_at: { gte: $created_at_start, lte: $created_at_end }
                type: { eq: $type }
                price: { gte: 1 }
              },
              limit: null
            ) {
              summary {
                count
                price {
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
          created_at_start: '2010-01-01T00:00:00.000Z',
          created_at_end: '2021-01-01T00:00:00.000Z',
          type: 'rent',
        },
      });

      expect(response).toMatchSnapshot();
    });

    test('regional-data', async () => {
      authenticateAs('slsDataExtraction', server);

      const response = await query({
        query: `
          query Extract(
            $created_at_start: String!
            $created_at_end: String!
            $category: String!
            $type: String!
          ) {
            properties(
              filter: {
                created_at: { gte: $created_at_start, lte: $created_at_end }
                category: { eq: $category }
                type: { eq: $type }
                rent_type: { in: ["monthly", "unknown"] }
                price: { gte: 1 }
              },
              limit: null
            ) {
              results {
                price
                lat
                lng
              }
            }
          }
        `,
        variables: {
          created_at_start: '2010-01-01T00:00:00.000Z',
          created_at_end: '2022-01-01T00:00:00.000Z',
          category: 'apartment',
          type: 'rent',
        },
      });

      expect(response).toMatchSnapshot();
    });

    test('regional-price-per-sqm', async () => {
      authenticateAs('slsDataExtraction', server);

      const response = await query({
        query: `
          query Extract(
            $created_at_start: String!
            $created_at_end: String!
            $category: String!
            $type: String!
          ) {
            properties(
              filter: {
                created_at: { gte: $created_at_start, lte: $created_at_end }
                category: { eq: $category }
                type: { eq: $type }
                rent_type: { in: ["monthly", "unknown"] }
                calc_price_per_sqm: { gt: 0 }
              },
              limit: null
            ) {
              results {
                calc_price_per_sqm
                lat
                lng
              }
            }
          }
        `,
        variables: {
          created_at_start: '2010-01-01T00:00:00.000Z',
          created_at_end: '2022-01-01T00:00:00.000Z',
          category: 'apartment',
          type: 'rent',
        },
      });

      expect(response).toMatchSnapshot();
    });
  });

  describe('static api', () => {
    test('regional-price-per-sqm', async () => {
      authenticateAs('slsStaticApi', server);

      const response = await query({
        query: `
          query Retrieve(
            $filter: PropertyFilter
          ) {
            properties(
              filter: $filter,
              limit: null
            ) {
              results {
                price
                price_per_sqm
              }
            }
          }
        `,
        variables: {
          filter: {
            published_at: {
              gte: '2010-01-01T00:00:00.000Z',
              lte: '2022-01-01T00:00:00.000Z',
            },
            category: {
              eq: 'apartment',
            },
            type: {
              eq: 'rent',
            },
            rent_type: {
              in: ['monthly', 'unknown'],
            },
            location_classificator: {
              eq: 'latvia-riga-agenskalns',
            },
          },
        },
      });

      expect(response).toMatchSnapshot();
    });
  });
});
