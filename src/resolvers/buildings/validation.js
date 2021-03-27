import moment from 'moment';

import Joi from 'lib/validator';

const schema = Joi.alternatives()
  .try(
    Joi.object({
      bounds: Joi.string().polygon().maxArea(0.0001).required(),
    }).required(),
    Joi.object({
      id: Joi.number().required(),
    }).required(),
  )
  .required();

export default schema;
