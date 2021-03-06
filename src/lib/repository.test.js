import mysql from './db';
import Repository from './repository';

jest.mock('./db');

describe('Repository', () => {
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
