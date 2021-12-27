import moment from 'moment';
import Joi from 'lib/validator';

const schema = Joi.object({
  lat: Joi.number().required(),
  lng: Joi.number().required(),
}).required();

export default schema;
