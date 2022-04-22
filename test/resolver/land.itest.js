import { createTestClient } from 'apollo-server-testing';
import { server } from 'handler';
import { authenticateAs } from 'helpers';
import db from 'db-config';

const { query } = createTestClient(server);

describe('Resolver: land', () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterEach(jest.clearAllMocks);

  test('successfully retrieves single land', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        query($id: Int!) {
          land(id: $id) {
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
        query($id: Int!) {
          land(id: $id) {
            id
            bounds
            cadastral_designation
            object_code
            area
            group_code
            location_classificator
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
              land {
                id
                sale_id
                cadastre_number
                property_address
                sale_date
                price
                land_cadastral_designations
                land_total_area_m2
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

  test('successfully retrieves land an property information', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        query($id: Int!) {
          land(id: $id) {
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

  test('successfully retrieves land VZD sales information', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        query($id: Int!) {
          land(id: $id) {
            id
            vzd {
              land {
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
          land {
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
        query($id: Int!) {
          land(id: $id) {
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

  test('throws an authentication error if trying to retrieve VZD land results without authorizing', async () => {
    const response = await query({
      query: `
        query($id: Int!) {
          land(id: $id) {
            id
            vzd {
              land {
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
