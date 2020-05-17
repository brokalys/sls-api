import Properties from './properties';
import mysql from 'lib/db';

jest.mock('lib/db');

describe('Properties', () => {
  let properties;

  beforeEach(() => {
    properties = new Properties({ client: 'mysql' });
  });

  describe('get', () => {
    it('returns the values', async () => {
      const results = [{ price: 100000 }, { price: 200000 }];
      mysql.query.mockResolvedValue(results);

      const output = await properties.get({
        source: 'brokalys.com',
      });

      expect(output).toEqual(results);
    });

    it('returns the values with an expression', async () => {
      const results = [{ price: 100000 }, { price: 200000 }];
      mysql.query.mockResolvedValue(results);

      const output = await properties.get({
        published_at: { gte: '2019-01-01' },
      });

      expect(output).toEqual(results);
    });
  });

  describe('getCount', () => {
    it('returns the count', async () => {
      const results = [{ count: 100 }];
      mysql.query.mockResolvedValue(results);

      const output = await properties.getCount({
        category: 'apartment',
      });

      expect(output).toEqual(100);
    });

    it('returns the count with a date expression', async () => {
      const results = [{ count: 100 }];
      mysql.query.mockResolvedValue(results);

      const output = await properties.getCount({
        published_at: { gte: '2019-01-01' },
      });

      expect(output).toEqual(100);
    });
  });
});
