import { createTestClient } from 'apollo-server-testing';
import { server } from 'handler';
import { authenticateAs } from 'helpers';
import db from 'db-config';

const { query } = createTestClient(server);

describe('Resolver: bounds - real queries from other services', () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterEach(jest.clearAllMocks);

  describe('map-app', () => {
    test('retrieve map data', async () => {
      authenticateAs('mapApp', server);

      const response = await query({
        query: `
          query (
            $bounds: String!
          ) {
            bounds(bounds: $bounds) {
              buildings {
                id
                bounds
                properties {
                  results {
                    category
                    type
                    rent_type
                    price
                    price_per_sqm
                    rooms
                    area
                    floor
                    published_at
                  }
                }
              }
            }
          }
        `,
        variables: {
          bounds:
            '56.992294 24.136619, 56.976394 23.99579, 56.992294 24.136619, 56.992294 24.136619',
        },
      });

      expect(response).toMatchSnapshot();
    });

    test('retrieve single building', async () => {
      authenticateAs('mapApp', server);

      const response = await query({
        query: `
          query (
            $id: Int!
            $filter: PropertyFilter
          ) {
            building(id: $id) {
              id
              bounds
              properties(filter: $filter) {
                results {
                  category
                  type
                  rent_type
                  price
                  price_per_sqm
                  rooms
                  area
                  floor
                  published_at
                }
              }
            }
          }
        `,
        variables: {
          id: 1,
          filter: {
            category: {
              in: ['apartment', 'house'],
            },
            type: {
              in: ['sell', 'rent'],
            },
            price: {
              gt: 1,
            },
          },
        },
      });

      expect(response).toMatchSnapshot();
    });
  });
});
