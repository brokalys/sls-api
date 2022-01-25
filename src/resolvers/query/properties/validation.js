import moment from 'moment';

import Joi from 'lib/validator';

const filter = Joi.object({
  published_at: Joi.object().filterOf(Joi.date().iso()),
  created_at: Joi.object().filterOf(Joi.date().iso()),
  category: Joi.object().filterOf(
    Joi.string()
      .lowercase()
      .valid('apartment', 'house', 'land', 'garage', 'office'),
  ),
  type: Joi.object().filterOf(
    Joi.string().lowercase().valid('sell', 'rent', 'auction'),
  ),
  rent_type: Joi.object().filterOf(
    Joi.string()
      .lowercase()
      .valid('yearly', 'monthly', 'weekly', 'daily', 'hourly', 'unknown'),
  ),
  location_classificator: Joi.object().filterOf(Joi.string()),
  price: Joi.object().filterOf(Joi.number().integer().min(1)),
  calc_price_per_sqm: Joi.object().filterOf(Joi.number().integer().min(0)),
  rooms: Joi.object().filterOf(Joi.number().integer().min(1)),
  floor: Joi.object().filterOf(Joi.number().integer().min(1)),
  area: Joi.object().filterOf(Joi.number().integer().min(1)),
  source: Joi.object().filterOf(Joi.string()),
  url: Joi.object().filterOf(Joi.string().uri()),
  foreign_id: Joi.object().filterOf(Joi.string().alphanum()),
  building_id: Joi.object().filterOf(Joi.string().alphanum()),
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
