import Moment from 'moment';
import numbers from 'numbers';
import { extendMoment } from 'moment-range';

import { getRegionsData } from './get-regions';

import cache from '../lib/cache';
import mysql from '../lib/db';
import Repository from '../lib/repository';

const moment = extendMoment(Moment);

function getChartData(parent, { category, type }) {
  let start = '01-01-2018';
  let end = moment()
    .subtract(1, 'month')
    .endOf('month')
    .format('DD-MM-YYYY');

  return cache.run(
    'getChartData.dataRetrieval',
    { category, type, start, end },
    dataRetrieval,
  );
}

async function dataRetrieval({ category, type, start, end }) {
  start = moment(start, 'DD-MM-YYYY');
  end = moment(end, 'DD-MM-YYYY');

  const range = moment.range(start, end);
  const months = Array.from(range.by('month')).map((date) =>
    date.format('YYYY-MM-DD'),
  );

  const monthlyResults = await Promise.all(
    months.map((month) =>
      cache.run('getChartData.dataRetrieval', { category, type, month }, () =>
        Repository.getRawChartData(category, type, month),
      ),
    ),
  );

  return monthlyResults.map((data) => {
    const medianPrice =
      numbers.statistic.median(
        data.map(({ price_per_sqm }) => price_per_sqm),
      ) || null;

    return {
      date: '2018-02-01',
      price_per_sqm: (medianPrice || 0).toFixed(2),
      count: data.length,
    };
  });
}

export default getChartData;
