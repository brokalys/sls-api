import mysql from './db';
import Repository from './repository';

jest.mock('./db');

describe('Repository', () => {
  describe('getProperty', () => {
    it('returns the values', async () => {
      const results = [{ price: 100000 }, { price: 200000 }];
      mysql.query.mockResolvedValue(results);

      const output = await Repository.getProperty({
        source: 'brokalys.com',
      });

      expect(output).toEqual(results);
    });

    it('returns the values with an expression', async () => {
      const results = [{ price: 100000 }, { price: 200000 }];
      mysql.query.mockResolvedValue(results);

      const output = await Repository.getProperty({
        published_at: { gte: '2019-01-01' },
      });

      expect(output).toEqual(results);
    });
  });

  describe('getPropertyCount', () => {
    it('returns the count', async () => {
      const results = [{ count: 100 }];
      mysql.query.mockResolvedValue(results);

      const output = await Repository.getPropertyCount({
        category: 'apartment',
      });

      expect(output).toEqual(100);
    });

    it('returns the count with a date expression', async () => {
      const results = [{ count: 100 }];
      mysql.query.mockResolvedValue(results);

      const output = await Repository.getPropertyCount({
        published_at: { gte: '2019-01-01' },
      });

      expect(output).toEqual(100);
    });
  });

  describe('getPingers', () => {
    it('returns the currently registered pingers', async () => {
      mysql.query.mockResolvedValue([
        {
          email: 'noreply@brokalys.com',
        },
        {
          email: 'noreply@brokalys.com',
        },
      ]);

      const output = await Repository.getPingers('noreply@brokalys.com');

      expect(output).toEqual([
        {
          email: 'noreply@brokalys.com',
        },
        {
          email: 'noreply@brokalys.com',
        },
      ]);
    });
  });

  describe('getPinger', () => {
    it('returns the currently registered pinger', async () => {
      mysql.query.mockResolvedValue([
        {
          email: 'noreply@brokalys.com',
        },
      ]);

      const output = await Repository.getPinger(123456789);

      expect(output).toEqual({
        email: 'noreply@brokalys.com',
      });
    });
  });

  describe('createPinger', () => {
    it('creates a new pinger', async () => {
      mysql.query.mockResolvedValue({
        insertId: 123456789,
      });

      const output = await Repository.createPinger({
        email: 'noreply@brokalys.com',
        category: 'APARTMENT',
        type: 'SELL',
        price_min: 1000,
        price_max: 1000000,
        rooms_min: 1,
        rooms_max: 5,
        area_m2_min: 100,
        area_m2_max: 10000,
        location: 'LAT LNG',
        comments: 'great service',
      });

      expect(output).toEqual(123456789);
    });
  });

  describe('createProperty', () => {
    it('creates a new property', async () => {
      mysql.query.mockResolvedValue({
        insertId: 123456789,
      });

      const output = await Repository.createProperty({
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

      const output = await Repository.createProperty({
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

  describe('confirmPinger', () => {
    it('confirms a pinger', async () => {
      mysql.query.mockResolvedValue({
        affectedRows: 1,
      });

      const output = await Repository.confirmPinger(123456789, 'key');

      expect(output).toEqual(true);
    });
  });

  describe('unsubscribePinger', () => {
    it('unsubscribes a pinger', async () => {
      mysql.query.mockResolvedValue({
        affectedRows: 1,
      });

      const output = await Repository.unsubscribePinger(123456789, 'key');

      expect(output).toEqual(true);
    });
  });

  describe('unsubscribeAllPingers', () => {
    it('unsubscribes all pingers by the key', async () => {
      mysql.query.mockResolvedValueOnce([
        {
          email: 'noreply@brokalys.com',
        },
      ]);
      mysql.query.mockResolvedValueOnce({
        affectedRows: 2,
      });

      const output = await Repository.unsubscribeAllPingers(123456789, 'key');

      expect(output).toEqual(true);
    });
  });
});
