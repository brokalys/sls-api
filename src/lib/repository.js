import crypto from 'crypto';
import moment from 'moment';

import mysql from './db';

class Repository {
  static async getPingers(email) {
    const data = await mysql.query({
      sql: `
        SELECT *
        FROM \`${process.env.DB_PINGER_DATABASE}\`.pinger_emails
        WHERE email = ?
          AND unsubscribed_at IS NULL
      `,
      values: [email],
    });

    return data;
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
          unsubscribe_key = ?
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
      await mysql.end();
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
