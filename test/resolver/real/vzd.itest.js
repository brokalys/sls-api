import { createTestClient } from 'apollo-server-testing';
import { server } from 'handler';
import { authenticateAs } from 'helpers';
import db from 'db-config';

const { query } = createTestClient(server);

describe('Resolver: vzd - real queries from customer apps', () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterEach(jest.clearAllMocks);

  describe('sls-static-api', () => {
    test('retrieve all the historical data', async () => {
      authenticateAs('slsStaticApi', server);

      const response = await query({
        query: `
          query($filters: VZDFilter!) {
            vzd {
              apartments(filter: $filters) {
                price
                area: apartment_total_area_m2
              }
              premises(filter: $filters) {
                price
                area: space_group_total_area_m2
              }
              houses(filter: $filters) {
                price
                area: building_total_area_m2
              }
            }
          }
        `,
        variables: {
          filters: {
            sale_date: {
              gte: '2020-09-01T00:00:00Z',
              lt: '2020-10-01T00:00:00Z',
            },
            location_classificator: { eq: 'latvia-riga-centrs' },
          },
        },
      });

      expect(response).toMatchSnapshot();
    });
  });
});
