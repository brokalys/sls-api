import { AuthenticationError, UserInputError } from 'apollo-server-lambda';

import Bugsnag from 'lib/bugsnag';
import Repository from 'lib/repository';
import validationSchema from './validation';

async function createProperty(parent, input, context) {
  if (!context.isAuthenticated) {
    throw new AuthenticationError();
  }

  const validator = validationSchema.validate(JSON.parse(input.input));

  // Validate input
  if (validator.error) {
    const error = new UserInputError('Input validation failed', {
      details: validator.error.details,
    });

    Bugsnag.notify(error, {
      metaData: {
        input,
        validator: validator.error.details,
      },
    });
    throw error;
  }

  const { value } = validator;

  await Repository.createProperty({
    ...value,
    additional_data: JSON.stringify(value.additional_data),
    image_count: value.images.length,
    images: JSON.stringify(value.images),
  });

  return true;
}

export default createProperty;
