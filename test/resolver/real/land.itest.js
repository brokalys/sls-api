import { createTestClient } from 'apollo-server-testing';
import { server } from 'handler';
import { authenticateAs } from 'helpers';
import db from 'db-config';

const { query } = createTestClient(server);

describe('Resolver: land - real queries from customer apps', () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterEach(jest.clearAllMocks);

  describe('map app', () => {
    test('retrieve all the historical data', async () => {
      authenticateAs('mapApp', server);

      const response = await query({
        query: `
          query($id: Int!, $filter: PropertyFilter) {
            land(id: $id) {
              id
              bounds
              properties(filter: $filter) {
                results {
                  category
                  type
                  rent_type
                  price
                  calc_price_per_sqm
                  rooms
                  area
                  floor_min: floor
                  date: published_at
                }
              }
              vzd {
                land {
                  date: sale_date
                  price
                  area: land_total_area_m2
                }
              }
            }
          }
        `,
        variables: {
          id: 1,
          filter: {
            price: { gte: 1 },
          },
        },
      });

      expect(response).toMatchSnapshot();
    });

    test('retrieve the historical data from land that has no sale_date', async () => {
      authenticateAs('mapApp', server);

      const response = await query({
        query: `
          query($id: Int!) {
            land(id: $id) {
              id
              bounds
              vzd {
                land {
                  date: sale_date
                  price
                  area: land_total_area_m2
                }
              }
            }
          }
        `,
        variables: {
          id: 2,
        },
      });

      expect(response).toMatchSnapshot();
    });
  });
});
