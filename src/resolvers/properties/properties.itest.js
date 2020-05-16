import { createTestClient } from 'apollo-server-testing';

import { server } from 'handler';
import db from 'lib/db';

jest.mock('lib/db');

describe('Query: properties', () => {
  let query;

  beforeEach(() => {
    process.env.BROKALYS_PRIVATE_KEY = 'PRIVATE_KEY';

    const utils = createTestClient(server);
    query = utils.query;
  });

  afterEach(jest.resetAllMocks);

  test('successfully retrieves property summary.count data', async () => {
    db.query.mockReturnValue([{ count: 120 }]);

    const response = await query({
      query: `
        {
          properties {
            summary {
              count
            }
          }
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  // @todo: passing headers to integration tests is currently not possible..
  // @see https://github.com/apollographql/apollo-server/issues/2277
  xtest('successfully retrieves results', async () => {
    db.query.mockReturnValue([{ id: 1 }, { id: 2 }]);

    const response = await query({
      query: `
        {
          properties {
            results {
              id
            }
          }
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  test.each([
    { filter: { published_at: { gte: 'value' } } }, // simply wrong value
    { filter: { published_at: '2019-01-01' } }, // missing filter expression
  ])('successfully retrieves property summary.count data', async (input) => {
    db.query.mockReturnValue([{ count: 120 }]);

    const response = await query({
      query: `
        query GetCount($filter: PropertyFilter) {
          properties(filter: $filter) {
            summary {
              count
            }
          }
        }
      `,
      variables: input,
    });

    expect(response.errors).toHaveLength(1);
  });

  test('throws an authentication error if trying to retrieve results without authorizing', async () => {
    db.query.mockReturnValue([{ id: 1 }, { id: 2 }]);

    const response = await query({
      query: `
        {
          properties {
            results {
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
