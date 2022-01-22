import moment from 'moment';
import Joi from 'lib/validator';

const schema = ({ maxArea = 0.0001 } = {}) =>
  Joi.object({
    bounds: Joi.string().polygon().maxArea(maxArea).required(),
  }).required();

export default schema;
