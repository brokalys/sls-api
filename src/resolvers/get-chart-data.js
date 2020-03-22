import { UserInputError } from 'apollo-server-lambda';
import Moment from 'moment';
import numbers from 'numbers';

import { getRegionsData } from './get-regions';

import cache from '../lib/cache';
import mysql from '../lib/db';
import Repository from '../lib/repository';

async function getChartData(parent, { category, type, date }) {
  const month = Moment(date, 'YYYY-MM-DD');

  // Validate
  if (month.isBefore('2018-01-01')) {
    throw new UserInputError('Date must be after 2018-01-01');
  }

  if (month.isAfter(Moment().startOf('month'))) {
    throw new UserInputError(
      'Date must not be bigger than start of current month',
    );
  }

  const start = month.clone().startOf('month').toISOString();
  const end = month.clone().endOf('month').toISOString();

  const data = await cache.run(
    'getChartData.dataRetrieval',
    { category, type, start, end },
    Repository.getRawChartData,
  );

  const medianPrice = numbers.statistic.median(
    data.map(({ price_per_sqm }) => price_per_sqm),
  );

  return {
    price_per_sqm: (medianPrice || 0).toFixed(2),
    count: data.length,
  };
}

export default getChartData;
