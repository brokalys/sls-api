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

    it('selects only specific fields', async () => {
      const results = [{ price: 100000 }, { price: 200000 }];
      mysql.query.mockResolvedValue(results);

      const output = await properties.get(
        {
          published_at: { gte: '2019-01-01' },
        },
        30,
        ['price'],
      );

      expect(output).toEqual(results);
      expect(mysql.query).toBeCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining('select `price`'),
        }),
      );
    });

    it('limits the results', async () => {
      const results = [{ price: 100000 }, { price: 200000 }];
      mysql.query.mockResolvedValue(results);

      const output = await properties.get(
        {
          published_at: { gte: '2019-01-01' },
        },
        10,
      );

      expect(output).toEqual(results);
      expect(mysql.query).toBeCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining('limit 10'),
        }),
      );
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

  describe('create', () => {
    it('creates a new property', async () => {
      mysql.query.mockResolvedValue({
        insertId: 123456789,
      });

      const output = await properties.create({
        category: 'APARTMENT',
        type: 'SELL',
        price: 10000,
      });

      expect(output).toEqual(123456789);
      expect(mysql.query).toBeCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining('lat_lng_point = point(0, 0)'),
        }),
      );
    });

    it('appends `lat_lng_point` if both coordinates exist', async () => {
      mysql.query.mockResolvedValue({
        insertId: 1,
      });

      const output = await properties.create({
        category: 'APARTMENT',
        type: 'SELL',
        price: 10000,
        lat: 12,
        lng: 34.13,
      });

      expect(output).toEqual(1);
      expect(mysql.query).toBeCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining('lat_lng_point = point(12, 34.13)'),
        }),
      );
    });
  });

  describe('buildPropertyQuery', () => {
    beforeEach(() => {
      mysql.query.mockRestore();
    });

    it.each([
      [
        { published_at: { gte: '2019-01-01' } },
        "`published_at` >= '2019-01-01'",
      ],
      [
        { published_at: { lte: '2019-01-01' } },
        "`published_at` <= '2019-01-01'",
      ],
      [{ published_at: { gt: '2019-01-01' } }, "`published_at` > '2019-01-01'"],
      [{ published_at: { lt: '2019-01-01' } }, "`published_at` < '2019-01-01'"],
      [{ source: { eq: 'mysite.com' } }, "`source` = 'mysite.com'"],
      [{ source: { neq: 'mysite.com' } }, "`source` != 'mysite.com'"],
      [{ source: { in: ['mysite.com'] } }, "`source` in ('mysite.com')"],
      [{ source: { nin: ['mysite.com'] } }, "`source` not in ('mysite.com')"],
      [
        { region: { in: ['special'] } },
        "ST_Contains(ST_GeomFromText('POLYGON((special))'), lat_lng_point)",
      ],
    ])('constructs a query with %j', (filters, queryExpectation) => {
      properties.get(filters);

      expect(mysql.query).toBeCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining(queryExpectation),
        }),
      );
    });
  });
});
