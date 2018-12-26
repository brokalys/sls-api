import { createTestClient } from 'apollo-server-testing';
import defaultQuery from './schema/default-query.graphql';
import { server } from './handler';

describe('Query', () => {
  let query;

  beforeEach(() => {
    const utils = createTestClient(server);
    query = utils.query;
  });

  describe('getRegionalStats', () => {
    test('fails validation if start date is past end date', async () => {
      const res = await query({
        query: `
        {
          getRegionalStats(
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
          getRegionalStats(
            category: APARTMENT
            type: SELL
            start_date: "2018-01-01"
            end_date: "2018-02-01"
          ) {
            name
            count
            min
            max
            mean
            median
            mode
            standardDev
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
          getRegionalStats(
            start_date: "2018-01-01"
            end_date: "2018-02-01"
          ) {
            name
            count
            min
            max
            mean
            median
            mode
            standardDev
          }
        }
      `,
      });

      expect(res).toMatchSnapshot();
    });
  });
});
