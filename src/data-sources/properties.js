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
      query.whereNot(field, filter.neq);
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

    const data = await mysql.query({
      sql: query.toString(),
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
    });

    return data;
  }

  async getCount(by) {
    const query = buildPropertyQuery(this.knex, by).count('*', {
      as: 'count',
    });

    const data = await mysql.query({
      sql: query.toString(),
      timeout: 20000,
    });

    return data[0].count;
  }
}

export default Properties;
