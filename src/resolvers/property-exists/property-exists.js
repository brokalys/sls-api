import { UserInputError } from 'apollo-server-lambda';

import Bugsnag from 'lib/bugsnag';
import Repository from 'lib/repository';
import validationSchema from './validation';

async function propertyExists(parent, input) {
  const validator = validationSchema.validate(input);

  // Validate input
  if (validator.error) {
    const error = new UserInputError('Input validation failed', {
      details: validator.error.details,
    });

    Bugsnag.addMetadata('input', input);
    Bugsnag.addMetadata('validator', validator.error.details);
    Bugsnag.notify(error);
    throw error;
  }

  const data = await Repository.getProperty(validator.value);
  return data.length > 0;
}

export default propertyExists;
