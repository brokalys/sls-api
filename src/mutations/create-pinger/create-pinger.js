import { UserInputError } from 'apollo-server-lambda';

import Repository from 'lib/repository';
import Joi from 'lib/validator';

// Validation schema
const validationSchema = Joi.object().keys({
  email: Joi.string().required().email({ allowUnicode: false }),
  category: Joi.string().required().valid('APARTMENT', 'HOUSE', 'LAND'),
  type: Joi.string().required().valid('SELL', 'RENT'),
  price_min: Joi.number().required().min(1),
  price_max: Joi.number().required().min(Joi.ref('price_min')).max(10000000),
  price_type: Joi.string().valid('TOTAL', 'SQM').default('TOTAL'),
  region: Joi.string().polygon(),
  rooms_min: Joi.number().min(0).default(0),
  rooms_max: Joi.number().min(Joi.ref('rooms_min')).max(20),
  area_m2_min: Joi.number().min(0).default(0),
  area_m2_max: Joi.number()
    .min(Joi.ref('area_m2_min'))
    .when('category', {
      is: Joi.valid('LAND'),
      then: Joi.number().max(1000000),
      otherwise: Joi.number().max(1000),
    }),
  frequency: Joi.string()
    .valid('IMMEDIATE', 'DAILY', 'WEEKLY', 'MONTHLY')
    .default('IMMEDIATE'),
  comments: Joi.string().allow('').max(255),
  marketing: Joi.boolean().default(false),
});

const MAX_PINGERS = 5;

async function createPinger(parent, input) {
  const { error, value } = validationSchema.validate(input);

  // Validate input
  if (error) {
    throw new UserInputError('Input validation failed', {
      details: error.details,
    });
  }

  const currentPingers = await Repository.getPingers(value.email);

  // Check against spam attempts
  if (currentPingers.length >= MAX_PINGERS) {
    throw new UserInputError(
      `Max amount of ${MAX_PINGERS} PINGERS per email exceeded.`,
      {
        maxPingers: MAX_PINGERS,
      },
    );
  }

  // Create a new PINGER
  await Repository.createPinger({
    email: value.email,
    category: value.category.toLowerCase(),
    type: value.type.toLowerCase(),
    price_min: value.price_min,
    price_max: value.price_max,
    price_type: value.price_type.toLowerCase(),
    location: [value.region, value.region.split(', ')[0]].join(', '),
    rooms_min: value.rooms_min,
    rooms_max: value.rooms_max,
    area_m2_min: value.area_m2_min,
    area_m2_max: value.area_m2_max,
    frequency: value.frequency.toLowerCase(),
    comments: value.comments,
    marketing: value.marketing,
  });

  return true;
}

export default createPinger;
