import moment from 'moment';
import Joi from 'lib/validator';

const schema = Joi.object({
  id: Joi.number().required(),
}).required();

export default schema;
