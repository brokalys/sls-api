import Joi from 'lib/validator';

const schema = Joi.object({
  source: Joi.string().domain().required(),
  foreign_id: Joi.string().alphanum().required(),
});

export default schema;
