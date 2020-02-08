import crypto from 'crypto';
import Moment from 'moment';

import mysql from './db';

class Repository {
  static async getRawChartData({ category, type, start, end }) {
    const data = await mysql.query({
      sql: `
        SELECT
          price, area, area_measurement,
          price_per_sqm, published_at
        FROM ${process.env.DB_DATABASE}.properties
        WHERE published_at BETWEEN ? AND ?
        ${type ? `AND type = "${type.toLowerCase()}"` : ''} # @todo: sanitize
        ${category ? `AND category = "${category.toLowerCase()}"` : ''}
        AND location_country = "Latvia"
        AND price > 1
      `,

      values: [start, end],
      typeCast(field, next) {
        if (field.name === 'published_at') {
          return `${field.string().substr(0, 7)}-01`;
        }

        return next();
      },
    });

    return data.map((row) => {
      if (!row.price_per_sqm && row.area_measurement === 'm2' && row.area) {
        row.price_per_sqm = row.price / row.area;
      }

      return row;
    });
  }

  static async getRegionData({ category, type, start, end }) {
    const data = await mysql.query({
      sql: `
        SELECT
          price, lat, lng, area,
          area_measurement, price_per_sqm
        FROM ${process.env.DB_DATABASE}.properties
        WHERE published_at BETWEEN ? AND ?
        ${type ? `AND type = "${type.toLowerCase()}"` : ''} # @todo: sanitize
        ${category ? `AND category = "${category.toLowerCase()}"` : ''}
        AND lat IS NOT NULL
        AND lng IS NOT NULL
        AND location_country = "Latvia"
        AND price > 1
      `,

      values: [start, end],
    });

    return data.map((row) => {
      if (!row.price_per_sqm && row.area_measurement === 'm2' && row.area) {
        row.price_per_sqm = row.price / row.area;
      }

      return row;
    });
  }

  static async getTableData({ category, start, end }) {
    const data = await mysql.query({
      sql: `
        SELECT
          type, price, lat, lng, area,
          area_measurement, price_per_sqm
        FROM ${process.env.DB_DATABASE}.properties
        WHERE published_at BETWEEN ? AND ?
        AND (type = "rent" AND rent_type = "monthly" OR type = "sell")
        AND category = ?
        AND lat IS NOT NULL
        AND lng IS NOT NULL
        AND location_country = "Latvia"
        AND price > 1
      `,

      values: [start, end, category],
    });

    return data.map((row) => {
      if (!row.price_per_sqm && row.area_measurement === 'm2' && row.area) {
        row.price_per_sqm = row.price / row.area;
      }

      return row;
    });
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

  static async createPinger(args) {
    const { affectedRows } = await mysql.query({
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
          confirmed = 0
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

    return affectedRows === 1;
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

    return affectedRows === 1;
  }
}

export default Repository;
