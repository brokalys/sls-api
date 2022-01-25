import Joi from 'lib/validator';

const filter = Joi.object({
  location_classificator: Joi.object().filterOf(Joi.string()),
}).default({});

const schema = Joi.object({
  filter,
  limit: Joi.alternatives()
    .try(Joi.number().integer().min(1).max(100).strict(), Joi.valid(null))
    .default(20),
}).default({});

export default schema;
