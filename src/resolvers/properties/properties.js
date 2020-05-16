import { AuthenticationError, UserInputError } from 'apollo-server-lambda';
import numbers from 'numbers';

import Repository from 'lib/repository';
import validationSchema from './validation';

async function properties(parent, input, context = {}) {
  const validator = validationSchema.validate(input);

  // Validate input
  if (validator.error) {
    throw new UserInputError('Input validation failed', {
      details: validator.error.details,
    });
  }

  const { value } = validator;

  return {
    results: () => {
      if (!context.isAuthenticated) {
        throw new AuthenticationError();
      }

      return Repository.getProperty(value.filter);
    },
    summary: {
      count: () => Repository.getPropertyCount(value.filter),
      price: async () => {
        const properties = await Repository.getProperty(
          value.filter,
          undefined,
          ['price'],
        );
        const prices = properties.map(({ price }) => price);

        return {
          median: Math.ceil(numbers.statistic.median(prices)) || null,
        };
      },
    },
  };
}

export default properties;
