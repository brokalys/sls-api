import { createTestClient } from 'apollo-server-testing';
import { server } from 'handler';
import { authenticateAs } from 'helpers';
import db from 'db-config';

const { query } = createTestClient(server);

describe('Resolver: buildings', () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterEach(jest.clearAllMocks);

  test('successfully retrieves multiple buildings', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        {
          buildings {
            id
          }
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  test('successfully retrieves ALL buildings with sufficient permissions', async () => {
    authenticateAs('slsStaticApi', server);

    const response = await query({
      query: `
        query {
          buildings(limit: null) {
            location_classificator
          }
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  test('successfully filters buildings by location', async () => {
    authenticateAs('mapApp', server);

    const response = await query({
      query: `
        query ($filter: BuildingFilter) {
          buildings(filter: $filter) {
            location_classificator
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
          buildings(limit: 10000) {
            id
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
          buildings(limit: null) {
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
        {
          buildings {
            id
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
