import { AuthenticationError, UserInputError } from 'apollo-server-lambda';
import { PERMISSION_READ_UNLIMITED_SALE_DATA } from 'lib/permissions';
import Joi from 'lib/validator';

const validationSchema = Joi.object({
  filter: Joi.object({
    sale_date: Joi.object().filterOf(Joi.date().iso()),
    location_classificator: Joi.object().filterOf(Joi.string()),
  }).default({}),
  limit: Joi.alternatives()
    .try(Joi.number().integer().min(1).max(100).strict(), Joi.valid(null))
    .default(20),
}).default({});

export default {
  land: (land, input, { dataSources, user }) => {
    const validator = validationSchema.validate(input);

    // Validate input
    if (validator.error) {
      throw new UserInputError('Input validation failed', {
        details: validator.error.details,
      });
    }

    if (!land.id) {
      const { limit } = validator.value;

      // Only specific customers can access unlimited properties
      if (!limit && !user.hasRole(PERMISSION_READ_UNLIMITED_SALE_DATA)) {
        throw new AuthenticationError(
          'You do not have sufficient permissions to query for unlimited results. Please provide a limit.',
        );
      }

      return dataSources.vzdLandSales.get(validator.value.filter, limit);
    }

    return dataSources.vzdLandSales.loadByLandCadastralDesignation(
      land.cadastral_designation,
      validator.value.filter,
    );
  },
};
