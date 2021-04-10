import moment from 'moment';

import Joi from 'lib/validator';

const filterable = (field) =>
  Joi.object({
    eq: field,
    neq: field,

    gt: field,
    gte: field,
    lt: field,
    lte: field,

    in: Joi.array().items(field),
    nin: Joi.array().items(field),
  });

const filter = Joi.object({
  published_at: filterable(Joi.date().iso()),
  created_at: filterable(Joi.date().iso()),
  category: filterable(
    Joi.string()
      .lowercase()
      .valid('apartment', 'house', 'land', 'garage', 'office'),
  ),
  type: filterable(Joi.string().lowercase().valid('sell', 'rent', 'auction')),
  rent_type: filterable(
    Joi.string()
      .lowercase()
      .valid('yearly', 'monthly', 'weekly', 'daily', 'hourly', 'unknown'),
  ),
  location_classificator: filterable(Joi.string()),
  region: filterable(Joi.string().polygon()),
  price: filterable(Joi.number().integer().min(1)),
  rooms: filterable(Joi.number().integer().min(1)),
  floor: filterable(Joi.number().integer().min(1)),
  area: filterable(Joi.number().integer().min(1)),
  source: filterable(Joi.string()),
  url: filterable(Joi.string().uri()),
  foreign_id: filterable(Joi.string().alphanum()),
  building_id: filterable(Joi.string().alphanum()),
}).default({});

const schema = Joi.object({
  filter,
  limit: Joi.alternatives()
    .try(Joi.number().integer().min(1).max(100).strict(), Joi.valid(null))
    .default(20),
}).default({});

export const discardSchema = Joi.object({
  discard: Joi.number().min(0).max(1).precision(2),
}).default({ discard: 0 });

export default schema;
