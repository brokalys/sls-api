import { AuthenticationError, UserInputError } from 'apollo-server-lambda';
import numbers from 'numbers';

import validationSchema from './validation';

async function properties(parent, input, context = { dataSources: {} }) {
  const validator = validationSchema.validate(input);

  // Validate input
  if (validator.error) {
    throw new UserInputError('Input validation failed', {
      details: validator.error.details,
    });
  }

  const { properties } = context.dataSources;
  const { value } = validator;

  return {
    results: () => {
      if (!context.isAuthenticated) {
        throw new AuthenticationError();
      }

      return properties.get(value.filter);
    },
    summary: {
      count: () => properties.getCount(value.filter),
      price: async () => {
        const data = await properties.get(value.filter, null, ['price']);
        const prices = data.map(({ price }) => price);

        return {
          median: Math.ceil(numbers.statistic.median(prices)) || null,
        };
      },
    },
  };
}

export default properties;
