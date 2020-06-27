import { riga, latvia } from '@brokalys/location-json-schemas';
import { AuthenticationError, UserInputError } from 'apollo-server-lambda';
import inside from 'point-in-polygon';

import Bugsnag from 'lib/bugsnag';
import * as SQS from 'lib/sqs';
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
    const allLatviaLocation = latvia.features
      .reverse()
      .find(
        ({ geometry }) =>
          !!geometry.coordinates[0].find((coord) => inside([lng, lat], coord)),
      );

    if (allLatviaLocation) {
      return allLatviaLocation.properties.id;
    }

    return;
  }

  return location.properties.id;
}

async function createProperty(parent, input, context = { dataSources: {} }) {
  if (!context.isAuthenticated) {
    throw new AuthenticationError();
  }

  const accountId = context.invokedFunctionArn.split(':')[4];
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

  const propertyData = {
    ...value,
    additional_data: JSON.stringify(value.additional_data),
    image_count: value.images.length,
    images: JSON.stringify(value.images),
    location_classificator: getLocationClassificator(value.lat, value.lng),
  };

  const actions = [
    // Create a new entry in the DB
    properties.create(propertyData),

    // Process the new entry via PINGER (SQS)
    SQS.sendMessage({
      MessageBody: JSON.stringify(propertyData),
      MessageDeduplicationId: propertyData.url,
      QueueUrl: `https://sqs.${process.env.AWS_REGION}.amazonaws.com/${accountId}/production-pinger`,
    }),
  ];

  await Promise.all(actions);

  return true;
}

export default createProperty;
