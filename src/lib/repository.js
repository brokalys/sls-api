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
          location = ?,
          rooms_min = ?,
          rooms_max = ?,
          area_m2_min = ?,
          area_m2_max = ?,
          description = ?,
          unsubscribe_key = ?,
          confirmed = 0
      `,
      values: [
        args.email,
        [args.category],
        [args.type],
        args.price_min,
        args.price_max,
        args.location,
        args.rooms_min,
        args.rooms_max,
        args.area_m2_min,
        args.area_m2_max,
        args.comments,
        crypto.randomBytes(20).toString('hex'),
      ],
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
}

export default Repository;
