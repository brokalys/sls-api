import Moment from 'moment';
import numbers from 'numbers';
import { extendMoment } from 'moment-range';

import { getRegionsData } from './get-regions';

import cache from '../lib/cache';
import mysql from '../lib/db';
import Repository from '../lib/repository';

const moment = extendMoment(Moment);

function getChartData(parent, { category, type }) {
  const start = '01-01-2018';
  const end = moment()
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

  const data = await Repository.getRawChartData(category, type, start, end);
  const range = moment.range(start, end);

  const mapped = Array.from(range.by('month')).map((date) => {
    const month = date.format('YYYY-MM-DD');
    const dataTwo = data.filter(({ published_at }) => month === published_at);

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
