import colormap from 'colormap';
import Moment from 'moment';
import { extendMoment } from 'moment-range';

import getRegions from './get-regions';

const moment = extendMoment(Moment);

const start = new Date(2018, 0, 1);
const end = moment().subtract(1, 'month');
const range = moment.range(start, end);

function getChartData(parent, { category }) {
  return Promise.all(
    Array.from(range.by('month')).map(async (date) => {
      const data = (await getRegions(parent, {
        category,
        start_date: date.format('YYYY-MM-DD'),
        end_date: date
          .clone()
          .add(1, 'month')
          .format('YYYY-MM-DD'),
      })).reduce(
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
        price_per_sqm: data.price,
        count: data.count,
      };
    }),
  );
}

export default getChartData;
