import Joi from '@hapi/joi';
import { UserInputError } from 'apollo-server-lambda';
import geojsonValidation from 'geojson-validation';

import Repository from '../lib/repository';

const customJoi = Joi.extend((joi) => ({
  type: 'string',
  base: Joi.string(),
  messages: {
    'string.polygon': '{{#label}} needs to be a valid polygon',
  },
  rules: {
    polygon: {
      validate(value, helpers, args, options) {
        const parts = [
          value.split(',').map((p) =>
            p
              .trim()
              .split(' ')
              .map((r) => parseFloat(r)),
          ),
        ];
        parts[0].push(parts[0][0]);

        if (!geojsonValidation.isPolygonCoor(parts)) {
          return helpers.error('string.polygon');
        }

        return value;
      },
    },
  },
}));

// Validation schema
const validationSchema = Joi.object().keys({
  email: Joi.string().required().email({ allowUnicode: false }),
  category: Joi.string().required().allow('APARTMENT', 'HOUSE', 'LAND'),
  type: Joi.string().required().allow('SELL', 'RENT'),
  price_min: Joi.number().required().min(1),
  price_max: Joi.number().required().min(Joi.ref('price_min')).max(10000000),
  region: customJoi.string().polygon(),
  rooms_min: Joi.number().min(0),
  rooms_max: Joi.number().min(Joi.ref('rooms_min')).max(20),
  area_m2_min: Joi.number().min(0),
  area_m2_max: Joi.number().min(Joi.ref('area_m2_min')).max(1000),
  comments: Joi.string().max(255),
});

const MAX_PINGERS = 5;

async function createPinger(parent, input) {
  const validator = validationSchema.validate(input);

  // Validate input
  if (validator.error) {
    throw new UserInputError('Input validation failed', {
      details: validator.error.details,
    });
  }

  const currentPingers = await Repository.getPingers(input.email);

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
    email: input.email,
    category: input.category.toLowerCase(),
    type: input.type.toLowerCase(),
    price_min: input.price_min,
    price_max: input.price_max,
    location: [input.region, input.region.split(', ')[0]].join(', '),
    rooms_min: input.rooms_min,
    rooms_max: input.rooms_max,
    area_m2_min: input.area_m2_min,
    area_m2_max: input.area_m2_max,
    comments: input.comments,
  });

  return true;
}

export default createPinger;
