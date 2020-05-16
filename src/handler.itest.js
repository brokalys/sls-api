import { createTestClient } from 'apollo-server-testing';

import { server } from 'handler';
import cache from 'lib/cache';
import db from 'lib/db';

jest.mock('lib/cache');
jest.mock('lib/db');

db.query.mockImplementation(() => [
  {
    count: 1,
    price: 110000.0,
    lat: 56.9366684,
    lng: 24.0794235,
    price_per_sqm: 100,
    area: 120,
    area_measurement: 'm2',
  },
  {
    price: 170000.0,
    lat: 56.9366684,
    lng: 24.0794235,
    price_per_sqm: 0,
    area: 1,
    area_measurement: 'ha',
  },
]);

describe('Query', () => {
  let query;

  beforeEach(() => {
    cache.get.mockReset();

    process.env.BROKALYS_PRIVATE_KEY = 'PRIVATE_KEY';

    const utils = createTestClient(server);
    query = utils.query;
  });

  describe('getPropertiesForPinger', () => {
    // @todo: passing headers to integration tests is currently not possible..
    // @see https://github.com/apollographql/apollo-server/issues/2277
    xtest('fails validation if region is invalid', async () => {
      const res = await query({
        query: `
        {
          getPropertiesForPinger(
            category: APARTMENT
            type: SELL
            start_date: "2019-01-01 00:00:00"
            region: "WRONG"
          ) {
            price
          }
        }
      `,
      });

      expect(res).toMatchSnapshot();
    });

    test('fails authenticating and returns nothing', async () => {
      const res = await query({
        query: `
        {
          getPropertiesForPinger(
            category: APARTMENT
            type: SELL
            start_date: "2019-01-01 00:00:00"
            region: "56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176, 56.992294 24.136619"
          ) {
            price
          }
        }
      `,
      });

      expect(res).toMatchSnapshot();
    });

    // @todo: passing headers to integration tests is currently not possible..
    // @see https://github.com/apollographql/apollo-server/issues/2277
    xtest('fetches data', async () => {
      const res = await query({
        query: `
        {
          getPropertiesForPinger(
            category: APARTMENT
            type: SELL
            start_date: "2019-01-01 00:00:00"
            region: "56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176, 56.992294 24.136619"
          ) {
            price
          }
        }
      `,
      });

      expect(res).toMatchSnapshot();
    });
  });
});

describe('Mutation', () => {
  let mutate;

  beforeEach(() => {
    cache.get.mockReset();

    const utils = createTestClient(server);
    mutate = utils.mutate;
  });

  describe('confirmPinger', () => {
    test('confirms an existing pinger', async () => {
      db.query.mockImplementation(() => ({
        affectedRows: 1,
      }));

      const response = await mutate({
        mutation: `
          mutation {
            confirmPinger(
              id: 1
              confirm_key: "test_123"
            )
          }
        `,
      });

      expect(response).toMatchSnapshot();
    });

    test('fails confirming a pinger with wrong credentials, but still responds with status = true', async () => {
      db.query.mockImplementation(() => ({
        affectedRows: 0,
      }));

      const response = await mutate({
        mutation: `
          mutation {
            confirmPinger(
              id: 1
              confirm_key: "wrong_credentials"
            )
          }
        `,
      });

      expect(response).toMatchSnapshot();
    });

    test('fails confirming with missing `id`', async () => {
      const response = await mutate({
        mutation: `
          mutation {
            confirmPinger(
              confirm_key: "test_123"
            )
          }
        `,
      });

      expect(response).toMatchSnapshot();
    });

    test('fails confirming with missing `confirm_key`', async () => {
      const response = await mutate({
        mutation: `
          mutation {
            confirmPinger(
              id: 1
            )
          }
        `,
      });

      expect(response).toMatchSnapshot();
    });
  });

  describe('unsubscribePinger', () => {
    test('unsubscribes an existing pinger', async () => {
      db.query.mockImplementation(() => ({
        affectedRows: 1,
      }));

      const response = await mutate({
        mutation: `
          mutation {
            unsubscribePinger(
              id: 1
              unsubscribe_key: "test_123"
            )
          }
        `,
      });

      expect(response).toMatchSnapshot();
    });

    test('unsubscribes all pingers of an email', async () => {
      db.query.mockReturnValueOnce([
        {
          email: 'test@brokalys.com',
        },
      ]);
      db.query.mockReturnValueOnce({
        affectedRows: 1,
      });

      const response = await mutate({
        mutation: `
          mutation {
            unsubscribePinger(
              id: 1
              unsubscribe_key: "test_123"
              all: true
            )
          }
        `,
      });

      expect(response).toMatchSnapshot();
    });

    test('fails unsubscribing a pinger with wrong credentials, but still responds with status = true', async () => {
      db.query.mockImplementation(() => ({
        affectedRows: 0,
      }));

      const response = await mutate({
        mutation: `
          mutation {
            unsubscribePinger(
              id: 1
              unsubscribe_key: "wrong_credentials"
            )
          }
        `,
      });

      expect(response).toMatchSnapshot();
    });

    test('fails unsubscribing with missing `id`', async () => {
      const response = await mutate({
        mutation: `
          mutation {
            unsubscribePinger(
              unsubscribe_key: "test_123"
            )
          }
        `,
      });

      expect(response).toMatchSnapshot();
    });

    test('fails unsubscribing with missing `unsubscribe_key`', async () => {
      const response = await mutate({
        mutation: `
          mutation {
            unsubscribePinger(
              id: 1
            )
          }
        `,
      });

      expect(response).toMatchSnapshot();
    });
  });
});
