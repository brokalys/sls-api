import { AuthenticationError, UserInputError } from 'apollo-server-lambda';

import Bugsnag from 'lib/bugsnag';
import validationSchema from './validation';

async function createProperty(parent, input, context = { dataSources: {} }) {
  if (!context.isAuthenticated) {
    throw new AuthenticationError();
  }

  const validator = validationSchema.validate(JSON.parse(input.input));

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

  const { properties } = context.dataSources;
  const { value } = validator;

  await properties.create({
    ...value,
    additional_data: JSON.stringify(value.additional_data),
    image_count: value.images.length,
    images: JSON.stringify(value.images),
  });

  return true;
}

export default createProperty;
