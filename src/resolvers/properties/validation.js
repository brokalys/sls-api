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

    in: field,
  });

const filter = Joi.object({
  category: filterable(
    Joi.string().lowercase().valid('apartment', 'house', 'land'),
  ),
  type: filterable(Joi.string().lowercase().valid('sell', 'rent')),
  region: filterable(Joi.array().items(Joi.string().polygonV2()).length(1)),
  published_at: filterable(Joi.date().iso()),
}).default({});

const schema = Joi.object({
  filter,
}).default({});

export default schema;
