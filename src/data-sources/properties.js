import { SQLDataSource } from 'datasource-sql';
import moment from 'moment';

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

  async getInBuildings(buildingIds) {
    if (buildingIds.length === 0) {
      return {};
    }

    const query = this.knex(`${process.env.DB_DATABASE}.properties`)
      .select([
        'id',
        'building_id',
        'category',
        'type',
        'rent_type',
        'price',
        'calc_price_per_sqm',
        'rooms',
        'area',
        'floor',
        'published_at',
      ])
      .whereIn('building_id', buildingIds)
      .whereIn('category', ['apartment', 'house', 'office'])
      .whereIn('type', ['sell', 'rent', 'auction'])
      .whereNotNull('type')
      .where('price', '>', 1)
      .orderBy('published_at', 'DESC');

    const data = await this.performQuery({ query }, { timeout: 2000 });

    // Construct a hash-map with the values
    // Key: building id
    // Value: array of properties
    const initialHashMap = buildingIds.reduce(
      (carry, id) => ({
        ...carry,
        [id]: [],
      }),
      {},
    );
    return data.reduce(
      (carry, item) => ({
        ...carry,
        [item.building_id]: [
          ...carry[item.building_id],
          {
            id: item.id,
            category: item.category,
            type: item.type,
            rent_type: item.type === 'rent' ? item.rent_type : undefined,
            price: item.price,
            price_per_sqm: item.calc_price_per_sqm,
            rooms: item.rooms,
            area: item.area,
            floor: item.floor,
            published_at: moment(item.published_at).isBefore('2018-01-01')
              ? undefined
              : moment(item.published_at).toISOString(),
          },
        ],
      }),
      initialHashMap,
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
