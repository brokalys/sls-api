import Joi from 'lib/validator';

const schema = Joi.object({
  source: Joi.string().domain().required(),
  url: Joi.string().uri(),
  foreign_id: Joi.string().alphanum(),
  created_at: Joi.date().iso(),
});

export default schema;
