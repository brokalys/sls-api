import { riga, latvia } from '@brokalys/location-json-schemas';
import { AuthenticationError, UserInputError } from 'apollo-server-lambda';
import crypto from 'crypto';
import inside from 'point-in-polygon';

import Bugsnag from 'lib/bugsnag';
import * as SQS from 'lib/sqs';
import validationSchema from './validation';

const md5sum = crypto.createHash('md5');

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
    calc_price_per_sqm: calculatePricePerSqm(value),
  };

  const actions = [
    // Create a new entry in the DB
    properties.create(propertyData),

    // Process the new entry via PINGER (SQS)
    SQS.sendMessage({
      MessageBody: JSON.stringify(propertyData),
      MessageDeduplicationId: crypto
        .createHash('md5')
        .update(propertyData.url)
        .digest('hex'),
      MessageGroupId: propertyData.source,
      QueueUrl: `https://sqs.${process.env.AWS_REGION}.amazonaws.com/${accountId}/${process.env.PINGER_PROPERTY_QUEUE_NAME}`,
    }),
  ];

  await Promise.all(actions);

  return true;
}

function calculatePricePerSqm(obj) {
  if (obj.price_per_sqm) {
    return obj.price_per_sqm;
  }

  if (obj.area > 0 && obj.area_measurement === 'm2' && obj.price > 0) {
    return obj.price / obj.area;
  }
}

export default createProperty;
