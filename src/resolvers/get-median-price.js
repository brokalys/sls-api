import { UserInputError } from 'apollo-server-lambda';
import moment from 'moment';
import numbers from 'numbers';

import cache from '../lib/cache';
import Repository from '../lib/repository';
import Joi from '../lib/validator';

// Validation schema
const validationSchema = Joi.object().keys({
  category: Joi.string().allow('APARTMENT', 'HOUSE', 'LAND'),
  type: Joi.string().allow('SELL', 'RENT'),
  start_date: Joi.date()
    .iso()
    .max(moment().utc().startOf('month').subtract(1, 'day'))
    .required(),
  region: Joi.string().required().polygonV2(),
});

async function getMedianPrice(parent, args) {
  const validator = validationSchema.validate(args);

  // Validate input
  if (validator.error) {
    throw new UserInputError('Input validation failed', {
      details: validator.error.details,
    });
  }

  const start = moment(args.start_date).utc().startOf('month');
  const end = start.clone().endOf('month');

  return await cache.run(
    'getMedianPrice',
    {
      category: args.category,
      type: args.type,
      start: start.format('YYYY-MM-DD'),
      end: end.format('YYYY-MM-DD'),
      region: args.region,
    },
    getData,
  );
}

async function getData(input) {
  const prices = await Repository.getPricesInRegion(input);

  return {
    price: Math.ceil(numbers.statistic.median(prices)) || null,
  };
}

export default getMedianPrice;
