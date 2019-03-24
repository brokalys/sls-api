import Moment from 'moment';

import mysql from './db';

class Repository {
  static async getRawChartData(category, type, month) {
    console.log('get', category, type, month);
    month = Moment(month, 'YYYY-MM-DD');
    const start = month.clone().startOf('month');
    const end = month.clone().endOf('month');

    const data = await mysql.query({
      sql: `
        SELECT
          price, area, area_measurement,
          price_per_sqm, published_at
        FROM properties
        WHERE published_at BETWEEN ? AND ?
        ${type ? `AND type = "${type.toLowerCase()}"` : ''} # @todo: sanitize
        ${category ? `AND category = "${category.toLowerCase()}"` : ''}
        AND location_country = "Latvia"
        AND price > 1
      `,

      values: [start.toISOString(), end.toISOString()],
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
}

export default Repository;
