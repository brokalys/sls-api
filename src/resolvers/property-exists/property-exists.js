import { UserInputError } from 'apollo-server-lambda';

import Repository from 'lib/repository';
import validationSchema from './validation';

async function propertyExists(parent, input) {
  const validator = validationSchema.validate(input);

  // Validate input
  if (validator.error) {
    throw new UserInputError('Input validation failed', {
      details: validator.error.details,
    });
  }

  const data = await Repository.getProperty(validator.value);
  return data.length > 0;
}

export default propertyExists;
