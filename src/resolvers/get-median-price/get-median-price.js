import { UserInputError } from 'apollo-server-lambda';
import moment from 'moment';
import numbers from 'numbers';

import Repository from 'lib/repository';
import Joi from 'lib/validator';

// Validation schema
const validationSchema = Joi.object().keys({
  category: Joi.string().valid('APARTMENT', 'HOUSE', 'LAND'),
  type: Joi.string().valid('SELL', 'RENT'),
  start_date: Joi.date()
    .iso()
    .max(moment().utc().startOf('month').subtract(1, 'day'))
    .required(),
  region: Joi.array().items(Joi.string().required().polygonV2()).length(1),
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

  const prices = await Repository.getPricesInRegion({
    category: args.category,
    type: args.type,
    start: start.format('YYYY-MM-DD'),
    end: end.format('YYYY-MM-DD'),
    region: args.region[0],
  });

  return {
    price: Math.ceil(numbers.statistic.median(prices)) || null,
  };
}

export default getMedianPrice;
