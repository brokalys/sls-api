import { createTestClient } from 'apollo-server-testing';
import { server } from 'handler';
import { authenticateAs } from 'helpers';
import db from 'db-config';

const { query } = createTestClient(server);

describe('Resolver: bounds', () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterEach(jest.clearAllMocks);

  test('successfully retrieves bounds data', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        query GetBounds($bounds: String!) {
          bounds(bounds: $bounds) {
            bounds
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

  test('successfully retrieves all the possible data', async () => {
    authenticateAs('slsCrawler', server);

    const response = await query({
      query: `
        query ($bounds: String!) {
          bounds(bounds: $bounds) {
            bounds
            buildings {
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
            }
            land {
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

  test('fails retrieving all the data due to missing permissions', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        query ($bounds: String!) {
          bounds(bounds: $bounds) {
            bounds
            buildings {
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

  test('successfully returns nothing if there are no buildings in this bound', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        query GetBuildings($bounds: String!) {
          bounds(bounds: $bounds) {
            buildings {
              id
              properties {
                results {
                  price
                }
              }
            }
          }
        }
      `,
      variables: {
        bounds:
          '56.944756215513316 24.09404948877113, 56.9404253703127 24.09404948877113, 56.9404253703127 24.086952363717725, 56.944756215513316 24.086952363717725, 56.944756215513316 24.09404948877113',
      },
    });

    expect(response).toMatchSnapshot();
  });

  test('successfully retrieves building and property information', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        query GetBuildingsAndProperties($bounds: String!) {
          bounds(bounds: $bounds) {
            buildings {
              id
              properties {
                results {
                  price
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

  test('successfully retrieves land and property information', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        query($bounds: String!) {
          bounds(bounds: $bounds) {
            land {
              id
              properties {
                results {
                  price
                }
              }
              vzd {
                land {
                  sale_id
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

  test('throws a validation exception if no bounds filter provided', async () => {
    const response = await query({
      query: `
        {
          bounds {
            bounds
          }
        }
      `,
    });
    authenticateAs('mapApp', server);

    expect(response).toMatchSnapshot();
  });

  test('throws a validation exception if bounds filter has too large location', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        query GetBounds($bounds: String!) {
          bounds(bounds: $bounds) {
            bounds
            buildings{
              properties {
                results {
                  id
                }
              }
            }
          }
        }
      `,
      variables: {
        bounds:
          '57.0510741522279 24.34369621296768, 56.86735048784755 24.34369621296768, 56.86735048784755 23.842917061051175, 57.0510741522279 23.842917061051175, 57.0510741522279 24.34369621296768',
      },
    });

    expect(response).toMatchSnapshot();
  });

  test('throws a validation exception if bounds filter has too large location, but allows for larger region if no property data requested', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        query GetBounds($bounds: String!) {
          bounds(bounds: $bounds) {
            bounds
          }
        }
      `,
      variables: {
        bounds:
          '57.0510741522279 24.34369621296768, 56.86735048784755 24.34369621296768, 56.86735048784755 23.842917061051175, 57.0510741522279 23.842917061051175, 57.0510741522279 24.34369621296768',
      },
    });

    expect(response).toMatchSnapshot();
  });

  test('throws an authentication error if trying to retrieve results without authorizing', async () => {
    const response = await query({
      query: `
        query GetBuildingsAndProperties($bounds: String!) {
          bounds(bounds: $bounds) {
            buildings {
              id
              properties {
                results {
                  price
                }
              }
            }
          }
        }
      `,
      variables: {
        bounds:
          '56.944756215513316 24.09404948877113, 56.9404253703127 24.09404948877113, 56.9404253703127 24.086952363717725, 56.944756215513316 24.086952363717725, 56.944756215513316 24.09404948877113',
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
