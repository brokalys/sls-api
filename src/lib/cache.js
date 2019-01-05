import crypto from 'crypto';

import mysql from './db';

function hash(key) {
  return crypto
    .createHash('md5')
    .update(JSON.stringify(key))
    .digest('hex');
}

const Cache = {
  async get(key) {
    const response = await mysql.query({
      sql: 'SELECT value FROM cache WHERE ?',
      values: {
        shortkey: hash(key),
      },
    });
    await mysql.end();

    if (response && response.length) {
      return JSON.parse(response[0].value);
    }
  },

  set(key, value) {
    return mysql.query({
      sql: 'INSERT INTO cache SET ?',
      values: {
        key: JSON.stringify(key),
        shortkey: hash(key),
        value: JSON.stringify(value),
      },
    });
  },
};

export default Cache;
