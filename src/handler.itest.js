import { createTestClient } from 'apollo-server-testing';
import { server } from './handler';
import cache from './lib/cache';
import db from './lib/db';

jest.mock('./lib/cache');
jest.mock('./lib/db');

db.query.mockImplementation(() => [
  {
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

    const utils = createTestClient(server);
    query = utils.query;
  });

  describe('getRegions', () => {
    test('fails validation if start date is past end date', async () => {
      const res = await query({
        query: `
        {
          getRegions(
            start_date: "2018-03-01"
            end_date: "2018-02-01"
          ) {
            name
          }
        }
      `,
      });

      expect(res).toMatchSnapshot();
    });

    test('fetches stats for each region with a defined category and type', async () => {
      const res = await query({
        query: `
        {
          getRegions(
            category: APARTMENT
            type: SELL
            start_date: "2018-01-01"
            end_date: "2018-02-01"
          ) {
            name
            price {
              count
              min
              max
              mean
              median
              mode
              standardDev
            }
            price_per_sqm {
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
      `,
      });

      expect(res).toMatchSnapshot();
    });

    test('fetches stats for each region with all categories and types', async () => {
      const res = await query({
        query: `
        {
          getRegions(
            start_date: "2018-01-01"
            end_date: "2018-02-01"
          ) {
            name
            price {
              count
            }
          }
        }
      `,
      });

      expect(res).toMatchSnapshot();
    });
  });

  describe('getRegion', () => {
    test('fails validation if start date is past end date', async () => {
      const res = await query({
        query: `
        {
          getRegion(
            name: "Āgenskalns"
            start_date: "2018-03-01"
            end_date: "2018-02-01"
          ) {
            name
          }
        }
      `,
      });

      expect(res).toMatchSnapshot();
    });

    test('fails validation if name is not defined', async () => {
      const res = await query({
        query: `
        {
          getRegion(
            start_date: "2018-03-01"
            end_date: "2018-02-01"
          ) {
            name
          }
        }
      `,
      });

      expect(res).toMatchSnapshot();
    });

    test('fetches stats for a single region with a defined category and type', async () => {
      const res = await query({
        query: `
        {
          getRegion(
            name: "Āgenskalns"
            category: APARTMENT
            type: SELL
            start_date: "2018-01-01"
            end_date: "2018-02-01"
          ) {
            name
            price {
              count
              min
              max
              mean
              median
              mode
              standardDev
            }
            price_per_sqm {
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
      `,
      });

      expect(res).toMatchSnapshot();
    });

    test('fetches stats for a single region with all categories and types', async () => {
      const res = await query({
        query: `
        {
          getRegion(
            name: "Āgenskalns"
            start_date: "2018-01-01"
            end_date: "2018-02-01"
          ) {
            name
            price {
              count
            }
          }
        }
      `,
      });

      expect(res).toMatchSnapshot();
    });

    test('fetches stats for a single region with uppercased region name', async () => {
      const res = await query({
        query: `
        {
          getRegion(
            name: "ĀGENSKALNS"
            start_date: "2018-01-01"
            end_date: "2018-02-01"
          ) {
            name
            price {
              count
            }
          }
        }
      `,
      });

      expect(res).toMatchSnapshot();
    });

    test('fetches stats from the cache', async () => {
      cache.get.mockReturnValue([{ name: 'Test' }]);

      const res = await query({
        query: `
        {
          getRegions(
            start_date: "2018-01-01"
            end_date: "2018-02-01"
          ) {
            name
          }
        }
      `,
      });

      expect(res).toMatchSnapshot();
    });
  });

  describe('getMapData', () => {
    test('fails validation if start date is past end date', async () => {
      const res = await query({
        query: `
        {
          getMapData(
            category: APARTMENT
            type: SELL
            start_date: "2018-03-01"
            end_date: "2018-02-01"
          ) {
            type
          }
        }
      `,
      });

      expect(res).toMatchSnapshot();
    });

    test('fetches map stats with all arguments', async () => {
      const res = await query({
        query: `
        {
          getMapData(
            category: APARTMENT
            type: SELL
            start_date: "2018-01-01"
            end_date: "2018-02-01"
          ) {
            type
            features {
              type
              properties {
                name
                color
              }
              geometry {
                type
                coordinates
              }
            }
          }
        }
      `,
      });

      expect(res).toMatchSnapshot();
    });
  });

  describe('getChartData', () => {
    test('fetches chart data with category = APARTMENT', async () => {
      const res = await query({
        query: `
        {
          getChartData(
            category: APARTMENT
            date: "2018-01-01"
          ) {
            count
            price_per_sqm
          }
        }
      `,
      });

      expect(res).toMatchSnapshot();
    });

    test('fetches chart data with category = APARTMENT, type = SELL', async () => {
      const res = await query({
        query: `
        {
          getChartData(
            category: APARTMENT
            type: SELL
            date: "2018-01-01"
          ) {
            count
            price_per_sqm
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

  describe('createPinger', () => {
    describe('creates a pinger', () => {
      test('with region as a plain string', async () => {
        const response = await mutate({
          mutation: `
            mutation {
              createPinger(
                email: "demo@email.com"
                category: APARTMENT
                type: SELL
                price_min: 10000
                price_max: 100000
                region: "TEST"
              )
            }
          `,
        });

        expect(response).toMatchSnapshot();
      });

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

    test('fails creating with invalid polymer (mid coordinate is malformed)', async () => {
      const response = await mutate({
        mutation: `
          mutation {
            createPinger(
              email: "demo@email.com"
              category: APARTMENT
              type: SELL
              price_min: 10000
              price_max: 100000
              region: "56.96715 24.09457, 56.97923 24.14125, 56.9825 24.17984, 56.95892 2417559, 56.94571 24.14812, 56.93767 24.13181, 56.96715 24.09457"
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
              region: "TEST"
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
              region: "TEST"
              rooms_min: 10
              rooms_max: 5
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
