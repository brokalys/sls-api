import { createTestClient } from 'apollo-server-testing';
import { server } from 'handler';
import { authenticateAs } from 'helpers';
import db from 'db-config';

const { query } = createTestClient(server);

describe('Resolver: buildings - real queries from customer apps', () => {
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
          query($buildingFilter: BuildingFilter!, $vzdFilter: VZDFilter!) {
            buildings(filter: $buildingFilter, limit: null) {
              vzd {
                apartments(filter: $vzdFilter) {
                  price
                  area: apartment_total_area_m2
                }
                premises(filter: $vzdFilter) {
                  price
                  area: space_group_total_area_m2
                }
                houses(filter: $vzdFilter) {
                  price
                  area: building_total_area_m2
                }
              }
            }
          }
        `,
        variables: {
          buildingFilter: {
            location_classificator: { eq: 'latvia-riga-centrs' },
          },
          vzdFilter: {
            sale_date: {
              gte: '2020-09-01T00:00:00Z',
              lt: '2020-10-01T00:00:00Z',
            },
          },
        },
      });

      expect(response).toMatchSnapshot();
    });
  });
});
