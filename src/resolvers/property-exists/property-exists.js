import { UserInputError } from 'apollo-server-lambda';

import Repository from 'lib/repository';
import validationSchema from './validation';

function propertyExists(parent, input) {
  const validator = validationSchema.validate(input);

  // Validate input
  if (validator.error) {
    throw new UserInputError('Input validation failed', {
      details: validator.error.details,
    });
  }

  return Repository.getProperty(validator.value).length > 0;
}

export default propertyExists;
