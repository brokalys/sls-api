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
          ) {
            date
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
