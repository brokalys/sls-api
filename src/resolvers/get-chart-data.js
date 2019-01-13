import Moment from 'moment';
import { extendMoment } from 'moment-range';

import { getRegionsData } from './get-regions';

import cache from '../lib/cache';

const moment = extendMoment(Moment);

const start = new Date(2018, 0, 1);
const end = moment().subtract(1, 'month');
const range = moment.range(start, end);

function getChartData(parent, { category }) {
  return cache.run('getChartData.dataRetrieval', { category }, dataRetrieval);
}

async function dataRetrieval({ category }) {
  return Promise.all(
    Array.from(range.by('month')).map(async (date) => {
      const data = await cache.run(
        'getChartData.getRegionsData',
        {
          category,
          start_date: date.format('YYYY-MM-DD'),
          end_date: date
            .clone()
            .add(1, 'month')
            .format('YYYY-MM-DD'),
        },
        getRegionsData,
      );

      const calculations = data.reduce(
        (full, row) => ({
          count: row.price_per_sqm.count + full.count,
          price: row.price_per_sqm.median + full.price,
        }),
        {
          price: 0,
          count: 0,
        },
      );

      return {
        date: date.format('YYYY-MM-DD'),
        price_per_sqm: (calculations.price / data.length).toFixed(2),
        count: calculations.count,
      };
    }),
  );
}

export default getChartData;
