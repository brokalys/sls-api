import { UserInputError } from 'apollo-server-lambda';
import moment from 'moment';

import Repository from 'lib/repository';
import Joi from 'lib/validator';

const minMaxJoi = {
  min: Joi.number().integer(),
  max: Joi.number().integer(),
};

// Validation schema
const validationSchema = Joi.object().keys({
  start_date: Joi.date()
    .iso()
    .min(moment().subtract(1, 'day'))
    .max('now')
    .required(),
  category: Joi.string().valid('APARTMENT', 'HOUSE', 'LAND'),
  type: Joi.string().valid('SELL', 'RENT'),
  region: Joi.string().required().polygonV2(),
  area: Joi.object().keys(minMaxJoi).default({}),
  rooms: Joi.object().keys(minMaxJoi).default({}),
  price: Joi.object().keys(minMaxJoi).default({}),
  floor: Joi.object().keys(minMaxJoi).default({}),
});

function getPropertiesForPinger(parent, args, context) {
  if (!context.isAuthenticated) {
    return null;
  }

  const validator = validationSchema.validate(args);

  if (validator.error) {
    throw new UserInputError('Input validation failed', {
      details: validator.error.details,
    });
  }

  return Repository.getPropertiesForPinger(validator.value);
}

export default getPropertiesForPinger;
