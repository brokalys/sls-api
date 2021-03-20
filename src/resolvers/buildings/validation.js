import moment from 'moment';

import Joi from 'lib/validator';

const schema = Joi.object({
  bounds: Joi.string().polygon().maxArea(0.0001).required(),
}).required();

export default schema;
