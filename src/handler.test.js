import { createTestClient } from 'apollo-server-testing';
import defaultQuery from './schema/default-query.graphql';
import { server } from './handler';

describe('Query', () => {
  let query;

  beforeEach(() => {
    const utils = createTestClient(server);
    query = utils.query;
  });

  describe('regions', () => {
    test('fails validation if start date is past end date', async () => {
      const res = await query({
        query: `
        {
          regions(
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
          regions(
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
          regions(
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

  describe('region', () => {
    test('fails validation if start date is past end date', async () => {
      const res = await query({
        query: `
        {
          region(
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
          region(
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
          region(
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
          region(
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
          region(
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
  });
});
