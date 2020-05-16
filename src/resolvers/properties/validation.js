import moment from 'moment';

import Joi from 'lib/validator';

const filter = Joi.object({
  category: Joi.string().lowercase().valid('apartment', 'house', 'land'),
  published_at: Joi.date()
    .iso()
    .min(moment().utc().subtract(1, 'month'))
    .max(moment().utc().startOf('month').subtract(1, 'day')),
}).default({});

const schema = Joi.object({
  filter,
}).default({});

export default schema;
