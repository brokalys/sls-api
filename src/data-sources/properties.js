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

function hasTimeframeFilter(filters) {
  return !!Object.entries(filters).find(([field, operations]) => {
    const hasGt = !!operations.gt || !!operations.gte;
    const hasLt = !!operations.lt || !!operations.lte;
    return hasLt && hasGt;
  });
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

    const cacheEnabled = hasTimeframeFilter(by);

    return this.performQuery(
      {
        query,
        cache: {
          enabled: cacheEnabled,
          ttl: 86400 * 7, // 7 days
        },
      },
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

    const cacheEnabled = hasTimeframeFilter(by);
    const data = await this.performQuery(
      {
        query,
        cache: {
          enabled: cacheEnabled,
          ttl: 86400 * 7, // 7 days
        },
      },
      {
        timeout: 20000,
      },
    );

    return data[0].count;
  }

  /**
   * A bit of hacking to enable datasource-sql caching mechanism
   */
  performQuery(queryConfig, config) {
    const { query, cache } = queryConfig;

    function getData() {
      return mysql.query({
        sql: query.toString(),
        ...config,
      });
    }

    if (!cache.enabled) {
      return getData();
    }

    query.then = async (callback) => {
      const data = await getData();
      return callback(data);
    };

    return this.cacheQuery(cache.ttl || 60, query);
  }
}

export default Properties;
