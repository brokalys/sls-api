import { createTestClient } from 'apollo-server-testing';
import { server } from 'handler';
import { authenticateAs } from 'helpers';
import db from 'db-config';

const { query } = createTestClient(server);

describe('Resolver: vzd', () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterEach(jest.clearAllMocks);

  test('successfully retrieves vzd apartment data', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        {
          vzd {
            apartments {
              id
            }
          }
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  test('successfully retrieves ALL vzd apartment data with sufficient permissions', async () => {
    authenticateAs('slsStaticApi', server);

    const response = await query({
      query: `
        query {
          vzd {
            apartments(limit: null) {
              id
            }
          }
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  test('successfully filters vzd apartment data by location', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        query ($filter: VZDFilter) {
          vzd {
            apartments(filter: $filter) {
              id
            }
          }
        }
      `,
      variables: {
        filter: {
          location_classificator: { eq: 'latvia-riga-centrs' },
        },
      },
    });

    expect(response).toMatchSnapshot();
  });

  test('throws a validation exception if limit too large provided', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        {
          vzd {
            apartments(limit: 10000) {
              id
            }
          }
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  test('throws a validation exception if no limit provided', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        {
          vzd {
            apartments(limit: null) {
              id
            }
          }
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  test('throws an authentication error if trying to retrieve results without authorizing', async () => {
    const response = await query({
      query: `
        {
          vzd {
            apartments {
              id
            }
          }
        }
      `,
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
