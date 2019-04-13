import Joi from 'joi';
import { ApolloError, UserInputError } from 'apollo-server-lambda';
import mailgunJs from 'mailgun-js';

import Repository from '../lib/repository';

const mailgun = mailgunJs({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

// Validation schema
const validationSchema = Joi.object().keys({
  email: Joi.string()
    .required()
    .email({ allowUnicode: false }),
  category: Joi.string()
    .required()
    .allow(['APARTMENT', 'HOUSE']),
  type: Joi.string()
    .required()
    .allow(['SELL', 'RENT']),
  price_min: Joi.number()
    .required()
    .min(1),
  price_max: Joi.number()
    .required()
    .min(Joi.ref('price_min'))
    .max(10000000),
  region: Joi.string(),
  rooms_min: Joi.number().min(0),
  rooms_max: Joi.number()
    .min(Joi.ref('rooms_min'))
    .max(20),
  area_m2_min: Joi.number().min(0),
  area_m2_max: Joi.number()
    .min(Joi.ref('area_m2_min'))
    .max(1000),
  comments: Joi.string().max(255),
});

const MAX_PINGERS = 5;

async function createPinger(parent, input) {
  const validator = Joi.validate(input, validationSchema);

  // Validate input
  if (validator.error) {
    throw new UserInputError('Input validation failed', {
      details: validator.error.details,
    });
  }

  const currentPingers = await Repository.getPingers(input.email);

  // Check against spam attempts
  if (currentPingers.length >= MAX_PINGERS) {
    throw new ApolloError(
      `Max amount of ${MAX_PINGERS} PINGERS per email exceeded.`,
      400,
    );
  }

  // Create a new unconfirmed PINGER
  await Repository.createPinger({
    email: input.email,
    category: input.category.toLowerCase(),
    type: input.type.toLowerCase(),
    price_min: input.price_min,
    price_max: input.price_max,
    location: input.region,
    rooms_min: input.rooms_min,
    rooms_max: input.rooms_max,
    area_m2_min: input.area_m2_min,
    area_m2_max: input.area_m2_max,
    comments: input.comments,
  });

  // Send a notification to admin
  await mailgun.messages().send({
    from: 'Brokalys PINGER <noreply@brokalys.com>',
    to: process.env.MAILGUN_TO_EMAIL,
    subject: 'New Brokalys Pinger',
    text: 'A new Brokalys Pinger has been added. Please confirm it.',
  });

  return true;
}

export default createPinger;
