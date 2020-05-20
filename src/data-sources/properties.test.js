import Properties from './properties';
import mysql from 'lib/db';

jest.mock('lib/db');

const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
};

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

    it('ignores cache', async () => {
      const results = [{ price: 100000 }, { price: 200000 }];
      mysql.query.mockResolvedValue(results);
      mockCache.get.mockResolvedValue(JSON.stringify(results));
      properties.initialize({
        cache: mockCache,
      });

      const output = await properties.get({
        source: 'brokalys.com',
      });

      expect(output).toEqual(results);
      expect(mockCache.get).not.toBeCalled();
    });

    it('returns the cached values', async () => {
      const results = [{ price: 100000 }, { price: 200000 }];
      mockCache.get.mockResolvedValue(JSON.stringify(results));
      properties.initialize({
        cache: mockCache,
      });

      const output = await properties.get({
        published_at: { gte: '2019-01-01', lte: '2019-02-01' },
      });

      expect(output).toEqual(results);
      expect(mockCache.get).toBeCalled();
      expect(mockCache.set).not.toBeCalled();
    });

    it('persists data to the cache', async () => {
      const results = [{ price: 100000 }, { price: 200000 }];
      mockCache.get.mockResolvedValue(undefined);
      properties.initialize({
        cache: mockCache,
      });

      const output = await properties.get({
        published_at: { gte: '2019-01-01', lte: '2019-02-01' },
      });

      expect(output).toEqual(results);
      expect(mockCache.get).toBeCalled();
      expect(mockCache.set).toBeCalled();
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

    it('ignores cache', async () => {
      const results = [{ count: 100 }];
      mysql.query.mockResolvedValue(results);
      mockCache.get.mockResolvedValue(JSON.stringify(results));
      properties.initialize({
        cache: mockCache,
      });

      const output = await properties.getCount({
        source: 'brokalys.com',
      });

      expect(output).toEqual(100);
      expect(mockCache.get).not.toBeCalled();
    });

    it('returns the cached values', async () => {
      const results = [{ count: 100 }];
      mockCache.get.mockResolvedValue(JSON.stringify(results));
      properties.initialize({
        cache: mockCache,
      });

      const output = await properties.getCount({
        published_at: { gte: '2019-01-01', lte: '2019-02-01' },
      });

      expect(output).toEqual(100);
      expect(mockCache.get).toBeCalled();
      expect(mockCache.set).not.toBeCalled();
    });

    it('persists data to the cache', async () => {
      mockCache.get.mockResolvedValue(undefined);
      properties.initialize({
        cache: mockCache,
      });

      const output = await properties.getCount({
        published_at: { gte: '2019-01-01', lte: '2019-02-01' },
      });

      expect(output).toEqual(100);
      expect(mockCache.get).toBeCalled();
      expect(mockCache.set).toBeCalled();
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
