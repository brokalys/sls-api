import { createTestClient } from 'apollo-server-testing';
import { server } from 'handler';
import { authenticateAs } from 'helpers';
import db from 'db-config';

const { query } = createTestClient(server);

describe('Resolver: building - real queries from customer apps', () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterEach(jest.clearAllMocks);

  describe('chrome extension', () => {
    test('retrieve all the historical data', async () => {
      authenticateAs('chromeExtension', server);

      const response = await query({
        query: `
          query($id: Int!) {
            building(id: $id) {
              id
              properties {
                results {
                  category
                  type
                  rent_type
                  price
                  calc_price_per_sqm
                  rooms
                  area
                  floor
                  published_at
                }
              }
              vzd {
                apartments {
                  id
                  cadastre_number
                  property_address
                  sale_date
                  price
                  land_cadastral_designations
                  land_area_m2
                  building_depreciation_percentage
                  building_cadastral_designations
                  space_group_lowest_floor
                  space_group_highest_floor
                  apartment_total_area_m2
                  room_count
                }
                premises {
                  id
                  cadastre_number
                  property_address
                  sale_date
                  price
                  land_cadastral_designations
                  land_area_m2
                  building_depreciation_percentage
                  building_cadastral_designations
                  space_group_lowest_floor
                  space_group_highest_floor
                  space_group_total_area_m2
                  space_count_in_space_group
                }
              }
            }
          }
        `,
        variables: {
          id: 1,
        },
      });

      expect(response).toMatchSnapshot();
    });
  });
});
