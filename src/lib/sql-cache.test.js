import SqlCache from './sql-cache';
import db from './db';

jest.mock('./db');

describe('SqlCache', () => {
  let cache;

  beforeEach(() => {
    cache = new SqlCache();
  });

  afterEach(jest.resetAllMocks);

  test('retrieves an existing item', async () => {
    const expectation = JSON.stringify({ price: 123 });
    db.query.mockReturnValue([{ value: expectation, expiry_ts: 9999999999 }]);

    const response = await cache.get('key:key-123');

    expect(response).toEqual(expectation);
  });

  test('returns nothing if the item is not in cache DB', async () => {
    const response = await cache.get('key:key-123');

    expect(response).toBeUndefined();
  });

  test('deletes an existing item that has expired', async () => {
    const expectation = JSON.stringify({ price: 123 });
    db.query.mockReturnValue([{ value: expectation, expiry_ts: 100 }]);

    const response = await cache.get('key:key-123');

    expect(response).toBeUndefined();
    expect(db.query).toBeCalledWith(
      expect.stringContaining('DELETE'),
      expect.anything(),
    );
  });

  test('inserts an item in the cache with TTL set', () => {
    cache.set('key:key-123', { data: true }, { ttl: 500 });

    expect(db.query).toBeCalled();
  });

  test('inserts an item in the cache without TTL set', () => {
    cache.set('key:key-123', { data: true });

    expect(db.query).toBeCalled();
  });
});
