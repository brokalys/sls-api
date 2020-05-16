import crypto from 'crypto';
import moment from 'moment';
import Knex from 'knex';

import mysql from './db';

const knex = Knex({ client: 'mysql' });

function buildPropertyQuery(filters) {
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

class Repository {
  static getPropertiesForPinger({
    start_date,
    category,
    type,
    price,
    rooms,
    floor,
    area,
    region,
  }) {
    return mysql.query({
      sql: `
        SELECT *
        FROM ${process.env.DB_DATABASE}.properties
        WHERE created_at > ?
        AND ST_Contains(ST_GeomFromText(?), lat_lng_point)
        ${category ? `AND category = "${category.toLowerCase()}"` : ''}
        ${type ? `AND type = "${type.toLowerCase()}"` : ''}
        ${
          type === 'rent'
            ? `AND (rent_type IS NULL OR rent_type = "monthly")`
            : ''
        }
        ${price.min > 0 ? `AND price >= ${price.min}` : ''}
        ${price.max > 0 ? `AND price <= ${price.max}` : ''}
        ${rooms.min > 0 ? `AND rooms >= ${rooms.min}` : ''}
        ${rooms.max > 0 ? `AND rooms <= ${rooms.max}` : ''}
        ${floor.min > 0 ? `AND floor >= ${floor.min}` : ''}
        ${floor.max > 0 ? `AND floor <= ${floor.max}` : ''}
        ${
          area.min > 0
            ? `AND (area >= ${area.min} AND area_measurement = "m2" OR area_measurement != "m2")`
            : ''
        }
        ${
          area.max > 0
            ? `AND (area <= ${area.max} AND area_measurement = "m2" OR area_measurement != "m2")`
            : ''
        }
        ORDER BY created_at
      `,
      values: [start_date, `POLYGON((${region}))`],
      typeCast(field, next) {
        if (field.name === 'content') {
          return field.string() || '';
        }
        if (field.name === 'images') {
          return JSON.parse(field.string());
        }

        return next();
      },
      timeout: 2000,
    });
  }

  static getProperty(by, limit = 30, fields = undefined) {
    const query = buildPropertyQuery(by);

    if (limit) {
      query.limit(limit);
    }

    if (fields) {
      query.select(fields);
    }

    return mysql.query({
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
      timeout: limit <= 100 ? 1000 : 20000,
    });
  }

  static async getPropertyCount(by) {
    const query = buildPropertyQuery(by).count('*', {
      as: 'count',
    });

    const data = await mysql.query({
      sql: query.toString(),
      timeout: 20000,
    });

    return data[0].count;
  }

  static async getPingers(email) {
    return await mysql.query({
      sql: `
        SELECT *
        FROM \`${process.env.DB_PINGER_DATABASE}\`.pinger_emails
        WHERE email = ?
          AND unsubscribed_at IS NULL
      `,
      values: [email],
    });
  }

  static async getPinger(id) {
    const [data] = await mysql.query({
      sql: `
        SELECT *
        FROM \`${process.env.DB_PINGER_DATABASE}\`.pinger_emails
        WHERE id = ?
      `,
      values: [id],
    });

    return data;
  }

  static async createProperty(values) {
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

  static async createPinger(args) {
    const { insertId } = await mysql.query({
      sql: `
        INSERT INTO \`${process.env.DB_PINGER_DATABASE}\`.pinger_emails
        SET
          email = ?,
          categories = ?,
          types = ?,
          price_min = ?,
          price_max = ?,
          rooms_min = ?,
          rooms_max = ?,
          area_m2_min = ?,
          area_m2_max = ?,
          location = ?,
          description = ?,
          unsubscribe_key = ?,
          confirmed = 1
      `,
      values: [
        args.email,
        JSON.stringify([args.category]),
        JSON.stringify([args.type]),
        args.price_min || null,
        args.price_max || null,
        args.rooms_min || null,
        args.rooms_max || null,
        args.area_m2_min || null,
        args.area_m2_max || null,
        args.location,
        args.comments,
        crypto.randomBytes(20).toString('hex'),
      ],
    });

    return insertId;
  }

  static async confirmPinger(id, confirmKey) {
    const { affectedRows } = await mysql.query({
      sql: `
        UPDATE \`${process.env.DB_PINGER_DATABASE}\`.pinger_emails
        SET confirmed = 1
        WHERE id = ?
          AND unsubscribe_key = ?
          AND confirmed = 0
      `,
      values: [id, confirmKey],
    });

    return affectedRows === 1;
  }

  static async unsubscribePinger(id, unsubscribeKey) {
    const { affectedRows } = await mysql.query({
      sql: `
        UPDATE \`${process.env.DB_PINGER_DATABASE}\`.pinger_emails
        SET unsubscribed_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND unsubscribe_key = ?
          AND unsubscribed_at IS NULL
      `,
      values: [id, unsubscribeKey],
    });

    return affectedRows === 1;
  }

  static async unsubscribeAllPingers(id, unsubscribeKey) {
    const data = await mysql.query({
      sql: `
        SELECT email
        FROM \`${process.env.DB_PINGER_DATABASE}\`.pinger_emails
        WHERE id = ?
          AND unsubscribe_key = ?
      `,
      values: [id, unsubscribeKey],
    });

    if (data.length === 0) {
      return false;
    }

    const { affectedRows } = await mysql.query({
      sql: `
        UPDATE \`${process.env.DB_PINGER_DATABASE}\`.pinger_emails
        SET unsubscribed_at = CURRENT_TIMESTAMP
        WHERE email = ?
          AND unsubscribed_at IS NULL
      `,
      values: [data[0].email],
    });

    return affectedRows >= 1;
  }
}

export default Repository;
