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

  describe('getInBuildings', () => {
    it('returns the values', async () => {
      mysql.query.mockResolvedValue([
        {
          id: 1,
          category: 'apartment',
          type: 'sell',
          rent_type: 'unknown',
          building_id: 1,
          price: 100000,
          calc_price_per_sqm: 100,
          rooms: 2,
          floor: 2,
          area: 100,
          published_at: '2020-01-01T00:00:00.000Z',
        },
        {
          id: 2,
          category: 'apartment',
          type: 'rent',
          rent_type: 'monthly',
          building_id: 2,
          price: 200000,
          calc_price_per_sqm: 200,
          rooms: 2,
          floor: 2,
          area: 100,
          published_at: '2017-01-01T00:00:00.000Z',
        },
      ]);

      const output = await properties.getInBuildings([1, 2, 3]);

      expect(output).toEqual({
        1: [
          {
            id: 1,
            category: 'apartment',
            type: 'sell',
            price: 100000,
            price_per_sqm: 100,
            rooms: 2,
            floor: 2,
            area: 100,
            published_at: '2020-01-01T00:00:00.000Z',
          },
        ],
        2: [
          {
            id: 2,
            category: 'apartment',
            type: 'rent',
            rent_type: 'monthly',
            price: 200000,
            price_per_sqm: 200,
            rooms: 2,
            floor: 2,
            area: 100,
            published_at: undefined,
          },
        ],
        3: [],
      });
    });

    it('does not perform a SQL call if no bulding ids provided', async () => {
      const output = await properties.getInBuildings([]);

      expect(output).toEqual({});
      expect(mysql.query).not.toBeCalled();
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

    it('returns 0 when no matches found', async () => {
      const results = [];
      mysql.query.mockResolvedValue(results);

      const output = await properties.getCount({
        category: { eq: 'apartment' },
      });

      expect(output).toEqual(0);
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
