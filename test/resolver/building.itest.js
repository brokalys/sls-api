import { createTestClient } from 'apollo-server-testing';
import { server } from 'handler';
import { authenticateAs } from 'helpers';
import db from 'db-config';

const { query } = createTestClient(server);

describe('Resolver: building', () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterEach(jest.clearAllMocks);

  test('successfully retrieves single building', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        query GetBuilding($id: Int!) {
          building(id: $id) {
            id
          }
        }
      `,
      variables: {
        id: 1,
      },
    });

    expect(response).toMatchSnapshot();
  });

  test('successfully retrieves all the available fields', async () => {
    authenticateAs('slsCrawler', server);

    const response = await query({
      query: `
        query ($id: Int!) {
          building(id: $id) {
            id
            bounds
            properties {
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
              houses {
                id
                cadastre_number
                property_address
                sale_date
                price
                land_cadastral_designations
                land_total_area_m2
                building_cadastral_designation
                building_overground_floors
                building_total_area_m2
                building_commissioning_year
                building_outer_wall_material
                building_depreciation_percentage
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

  test('successfully retrieves building an property information', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        query GetBuildingsAndProperties($id: Int!) {
          building(id: $id) {
            id
            properties {
              results {
                price
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

  test('successfully retrieves building VZD sales information', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        query($id: Int!) {
          building(id: $id) {
            id
            vzd {
              apartments {
                id
                cadastre_number
                price
              }
              premises {
                id
                cadastre_number
                price
              }
              houses {
                id
                cadastre_number
                price
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

  test('throws a validation exception if no id filter provided', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        {
          building {
            id
          }
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  test('throws an authentication error if trying to retrieve results without authorizing', async () => {
    const response = await query({
      query: `
        query GetBuildingsAndProperties($id: Int!) {
          building(id: $id) {
            id
            properties {
              results {
                price
              }
            }
          }
        }
      `,
      variables: {
        id: 1,
      },
    });

    expect(response.errors).toEqual([
      expect.objectContaining({
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      }),
    ]);
  });

  test('throws an authentication error if trying to retrieve VZD apartment results without authorizing', async () => {
    const response = await query({
      query: `
        query($id: Int!) {
          building(id: $id) {
            id
            vzd {
              apartments {
                price
              }
            }
          }
        }
      `,
      variables: {
        id: 1,
      },
    });

    expect(response.errors).toEqual([
      expect.objectContaining({
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      }),
    ]);
  });

  test('throws an authentication error if trying to retrieve VZD premise results without authorizing', async () => {
    const response = await query({
      query: `
        query($id: Int!) {
          building(id: $id) {
            id
            vzd {
              premises {
                price
              }
            }
          }
        }
      `,
      variables: {
        id: 1,
      },
    });

    expect(response.errors).toEqual([
      expect.objectContaining({
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      }),
    ]);
  });

  test('throws an authentication error if trying to retrieve VZD house results without authorizing', async () => {
    const response = await query({
      query: `
        query($id: Int!) {
          building(id: $id) {
            id
            vzd {
              houses {
                price
              }
            }
          }
        }
      `,
      variables: {
        id: 1,
      },
    });

    expect(response.errors).toEqual([
      expect.objectContaining({
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      }),
    ]);
  });
});
