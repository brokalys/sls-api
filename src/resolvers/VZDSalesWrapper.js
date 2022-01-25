import { UserInputError } from 'apollo-server-lambda';
import Joi from 'lib/validator';

const validationSchema = Joi.object({
  filter: Joi.object({
    sale_date: Joi.object().filterOf(Joi.date().iso()),
  }).default({}),
}).default({});

export default {
  apartments: (building, input, { dataSources }) => {
    const validator = validationSchema.validate(input);

    // Validate input
    if (validator.error) {
      throw new UserInputError('Input validation failed', {
        details: validator.error.details,
      });
    }

    return dataSources.vzdApartmentSales.loadByBuildingId(building.id, {
      ...validator.value.filter,
      object_type: { eq: 'Dz' },
    });
  },

  premises: (building, input, { dataSources }) => {
    const validator = validationSchema.validate(input);

    // Validate input
    if (validator.error) {
      throw new UserInputError('Input validation failed', {
        details: validator.error.details,
      });
    }

    return dataSources.vzdApartmentSales.loadByBuildingId(building.id, {
      ...validator.value.filter,
      object_type: { eq: 'T' },
    });
  },

  houses: (building, input, { dataSources }) => {
    const validator = validationSchema.validate(input);

    // Validate input
    if (validator.error) {
      throw new UserInputError('Input validation failed', {
        details: validator.error.details,
      });
    }

    return dataSources.vzdHouseSales.loadByBuildingId(
      building.id,
      validator.value.filter,
    );
  },
};
