import Moment from 'moment';
import numbers from 'numbers';
import { extendMoment } from 'moment-range';

import { getRegionsData } from './get-regions';

import cache from '../lib/cache';
import mysql from '../lib/db';

const moment = extendMoment(Moment);

const start = new Date(2018, 0, 1);
const end = moment().subtract(1, 'month');
const range = moment.range(start, end);

function getChartData(parent, { category }) {
  return cache.run('getChartData.dataRetrieval', { category }, dataRetrieval);
}

async function dataRetrieval({ category }) {
  await mysql.connect();
  const connection = mysql.getClient();

  const data = (await mysql.query({
    sql: `
      SELECT price, area, area_measurement, price_per_sqm, published_at
      FROM properties
      WHERE published_at BETWEEN ? AND ?
      ${
        category
          ? `AND category = ${connection.escape(category.toLowerCase())}`
          : ''
      }
      AND location_country = "Latvia"
      AND price > 1
    `,

    values: [start.toISOString(), end.endOf('day').toISOString()],
  })).map((row) => {
    if (!row.price_per_sqm && row.area_measurement === 'm2' && row.area) {
      row.price_per_sqm = row.price / row.area;
    }

    row.month = moment(row.published_at).format('YYYY-MM-DD');

    return row;
  });

  await mysql.end();

  const mapped = Array.from(range.by('month')).map((date) => {
    const month = date.format('YYYY-MM-DD');
    const dataTwo = data.filter((row) => month === row.month);

    const medianPrice =
      numbers.statistic.median(
        dataTwo.map(({ price_per_sqm }) => price_per_sqm),
      ) || null;

    return {
      date: month,
      price_per_sqm: (medianPrice || 0).toFixed(2),
      count: dataTwo.length,
    };
  });

  return mapped;
}

export default getChartData;