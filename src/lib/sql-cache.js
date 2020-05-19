import db from './db';

class SqlCache {
  /**
   * Retrieve an item from the cache.
   */
  async get(key) {
    const data = await db.query(
      `
      SELECT
        value,
        (ttl + UNIX_TIMESTAMP(created_at)) as expiry_ts
      FROM ${process.env.DB_CACHE_DATABASE}.cache
      WHERE ${process.env.DB_CACHE_DATABASE}.key = ?
      `,
      [key],
    );

    if (data && data.length) {
      const row = data[0];

      // Delete expired cache items
      if (Date.now() >= row.expiry_ts * 1000) {
        await db.query(
          `DELETE FROM ${process.env.DB_CACHE_DATABASE}.cache WHERE cache.key = ?`,
          [key],
        );
        return;
      }

      // Return cached item
      return row.value;
    }
  }

  /**
   * Put a new item in the cache.
   */
  async set(key, value, options = {}) {
    await db.query(`INSERT INTO ${process.env.DB_CACHE_DATABASE}.cache SET ?`, {
      key,
      value,
      ttl: options.ttl,
    });
  }
}

export default SqlCache;
