import { SQLDataSource } from 'datasource-sql';

import mysql from 'lib/db';

function buildPropertyQuery(knex, filters) {
  const query = knex(`${process.env.DB_DATABASE}.properties`);

  function buildQueryPart(field, filter = {}) {
    if (typeof filter !== 'object') {
      return query.where(field, filter);
    }

    if (filter.in) {
      // Reserved keyword
      if (field === 'region') {
        query.whereRaw('ST_Contains(ST_GeomFromText(?), lat_lng_point)', [
          `POLYGON((${filter.in[0]}))`,
        ]);
      } else {
        query.whereIn(field, filter.in);
      }
    }

    if (filter.nin) {
      query.whereNotIn(field, filter.nin);
    }

    if (filter.eq) {
      query.where(field, filter.eq);
    }

    if (filter.neq) {
      query.where(field, '!=', filter.neq);
    }

    if (filter.gt) {
      query.where(field, '>', filter.gt);
    }

    if (filter.gte) {
      query.where(field, '>=', filter.gte);
    }

    if (filter.lt) {
      query.where(field, '<', filter.lt);
    }

    if (filter.lte) {
      query.where(field, '<=', filter.lte);
    }
  }

  Object.entries(filters).forEach(([key, value]) => buildQueryPart(key, value));
  return query;
}

class Properties extends SQLDataSource {
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
        timeout: limit && limit <= 100 ? 1000 : 5000,
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
