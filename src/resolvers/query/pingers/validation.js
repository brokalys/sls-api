import Joi from 'lib/validator';

const schema = Joi.object({
  id: Joi.string().required(),
  unsubscribe_key: Joi.string().required(),
}).default({});

export default schema;
