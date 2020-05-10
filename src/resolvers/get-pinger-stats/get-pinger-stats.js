import { UserInputError } from 'apollo-server-lambda';

import Repository from 'lib/repository';
import Joi from 'lib/validator';

// Validation schema
const validationSchema = Joi.object().keys({
  category: Joi.string().required().allow('APARTMENT', 'HOUSE', 'LAND'),
  type: Joi.string().required().allow('SELL', 'RENT'),
  price_min: Joi.number().required().min(1),
  price_max: Joi.number().required().min(Joi.ref('price_min')).max(10000000),
  region: Joi.string().polygon(),
  rooms_min: Joi.number().min(0),
  rooms_max: Joi.number().min(Joi.ref('rooms_min')).max(20),
  area_m2_min: Joi.number().min(0),
  area_m2_max: Joi.number().min(Joi.ref('area_m2_min')).max(1000),
});

async function getPingerStats(parent, input) {
  const validator = validationSchema.validate(input);

  // Validate input
  if (validator.error) {
    throw new UserInputError('Input validation failed', {
      details: validator.error.details,
    });
  }

  const count = await Repository.getPingerCount({
    category: input.category.toLowerCase(),
    type: input.type.toLowerCase(),
    price_min: input.price_min,
    price_max: input.price_max,
    region: [input.region, input.region.split(', ')[0]].join(', '),
    rooms_min: input.rooms_min,
    rooms_max: input.rooms_max,
    area_m2_min: input.area_m2_min,
    area_m2_max: input.area_m2_max,
  });

  return {
    pingers_last_month: count,
  };
}

export default getPingerStats;
