import { SQLDataSource } from 'datasource-sql';

import mysql from 'lib/db';

class Pingers extends SQLDataSource {
  async get(by, limit = 30, fields = undefined) {
    const query = buildPropertyQuery(this.knex, by);

    if (limit) {
      query.limit(limit);
    }

    if (fields) {
      query.select(fields);
    }

    return this.performQuery(
      { query },
      {
        typeCast(field, next) {
          if (field.name === 'content') {
            return field.string() || '';
          }
          if (field.name === 'images') {
            return JSON.parse(field.string());
          }

          return next();
        },
        timeout: limit && limit <= 100 ? 1000 : 20000,
      },
    );
  }

  async getCount(by) {
    const query = buildPropertyQuery(this.knex, by).count('*', {
      as: 'count',
    });

    const data = await this.performQuery(
      { query },
      {
        timeout: 20000,
      },
    );

    if (!data.length) {
      return 0;
    }

    return data[0].count;
  }

  async create(values) {
    const lat_lng_point = `, lat_lng_point = point(${[
      values.lat || 0,
      values.lng || 0,
    ].join(', ')})`;
    const { insertId } = await mysql.query({
      sql: `INSERT INTO \`${process.env.DB_DATABASE}\`.properties SET ? ${lat_lng_point}`,
      values,
      timeout: 1000,
    });

    return insertId;
  }

  performQuery(queryConfig, config) {
    const { query } = queryConfig;

    return mysql.query({
      sql: query.toString(),
      ...config,
    });
  }
}

export default Properties;
