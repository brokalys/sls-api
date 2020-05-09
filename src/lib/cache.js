import crypto from 'crypto';

import mysql from './db';

function hash(key) {
  return crypto.createHash('md5').update(JSON.stringify(key)).digest('hex');
}

export default {
  async run(key, params, callback) {
    const cached = await this.get(key, params);

    if (cached) {
      return cached;
    }

    const newData = await callback(params);
    await this.set(key, params, newData);

    return newData;
  },

  async get(key, params) {
    const response = await mysql.query({
      sql: `SELECT value FROM ${process.env.DB_CACHE_DATABASE}.cache WHERE \`key\` = ? and \`params_hash\` = ?`,
      values: [key, hash(params)],
    });

    if (response && response.length) {
      return JSON.parse(response[0].value);
    }
  },

  set(key, params, value) {
    return mysql.query({
      sql: `INSERT INTO ${process.env.DB_CACHE_DATABASE}.cache SET ?`,
      values: {
        key,
        params: JSON.stringify(params),
        params_hash: hash(params),
        value: JSON.stringify(value),
      },
    });
  },
};
