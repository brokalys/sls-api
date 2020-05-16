import { AuthenticationError, UserInputError } from 'apollo-server-lambda';

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
    },
  };
}

export default properties;
