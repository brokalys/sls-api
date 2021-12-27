import { createTestClient } from 'apollo-server-testing';
import { server } from 'handler';
import { authenticateAs } from 'helpers';
import db from 'db-config';

const { query } = createTestClient(server);

describe('Resolver: point - real queries from customer apps', () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterEach(jest.clearAllMocks);

  describe('chrome extension', () => {
    test('retrieve all the historical data', async () => {
      authenticateAs('mapApp', server);

      const response = await query({
        query: `
          query (
            $lat: Float!
            $lng: Float!
          ) {
            point(lat: $lat, lng: $lng) {
              buildings {
                id
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
          lat: 0.6551,
          lng: 0.4123,
        },
      });

      expect(response).toMatchSnapshot();
    });
  });
});
