import { riga } from '@brokalys/location-json-schemas';
import { AuthenticationError, UserInputError } from 'apollo-server-lambda';
import inside from 'point-in-polygon';

import Bugsnag from 'lib/bugsnag';
import validationSchema from './validation';

/**
 * Classify locations for faster regional lookups.
 */
function getLocationClassificator(lat, lng) {
  if (!lat || !lng) {
    return;
  }

  const location = riga.features.find(({ geometry }) =>
    inside([lng, lat], geometry.coordinates[0]),
  );

  if (!location) {
    return;
  }

  return location.properties.id;
}

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
    location_classificator: getLocationClassificator(value.lat, value.lng),
  });

  return true;
}

export default createProperty;
