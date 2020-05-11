import { createTestClient } from 'apollo-server-testing';

import { server } from 'handler';
import cache from 'lib/cache';
import db from 'lib/db';

jest.mock('lib/cache');
jest.mock('lib/db');

describe('Mutation: createPinger', () => {
  let mutate;

  beforeEach(() => {
    cache.get.mockReset();

    const utils = createTestClient(server);
    mutate = utils.mutate;
  });

  describe('creates a pinger', () => {
    test('with region as a polygon', async () => {
      const response = await mutate({
        mutation: `
          mutation {
            createPinger(
              email: "demo@email.com"
              category: APARTMENT
              type: SELL
              price_min: 10000
              price_max: 100000
              region: "56.96715 24.09457, 56.97923 24.14125, 56.9825 24.17984, 56.95892 24.17559, 56.94571 24.14812, 56.93767 24.13181"
            )
          }
        `,
      });

      expect(response).toMatchSnapshot();
    });
  });

  test('fails creating with invalid polygon', async () => {
    const response = await mutate({
      mutation: `
        mutation {
          createPinger(
            email: "demo@email.com"
            category: APARTMENT
            type: SELL
            price_min: 10000
            price_max: 100000
            region: "very wrong, 56.95892 24.17559, 56.94571 24.14812, 56.93767 24.13181"
          )
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  test('fails creating a pinger if 5 already exist', async () => {
    db.query.mockImplementation(() => [
      { email: 'demo@email.com' },
      { email: 'demo@email.com' },
      { email: 'demo@email.com' },
      { email: 'demo@email.com' },
      { email: 'demo@email.com' },
    ]);

    const response = await mutate({
      mutation: `
        mutation {
          createPinger(
            email: "demo@email.com"
            category: APARTMENT
            type: SELL
            price_min: 10000
            price_max: 100000
            region: "56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176"
          )
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  test('fails creating a pinger if input validation fails', async () => {
    const response = await mutate({
      mutation: `
        mutation {
          createPinger(
            email: "demo@email.com"
            category: APARTMENT
            type: SELL
            price_min: 10000
            price_max: 100000
            region: "56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176"
            rooms_min: 10
            rooms_max: 5
          )
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });
});
