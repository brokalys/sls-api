import moment from 'moment';

import Joi from 'lib/validator';

const filter = Joi.object({
  category: Joi.string().lowercase().valid('apartment', 'house', 'land'),
  type: Joi.string().lowercase().valid('sell', 'rent'),
  region: Joi.string().polygonV2(),
  published_at: Joi.date()
    .iso()
    .min(moment().utc().subtract(1, 'month'))
    .max(moment().utc()),
}).default({});

const schema = Joi.object({
  filter,
}).default({});

export default schema;
