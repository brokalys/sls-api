import { riga, latvia } from '@brokalys/location-json-schemas';
import { UserInputError } from 'apollo-server-lambda';
import moment from 'moment';
import inside from 'point-in-polygon';

import Bugsnag from 'lib/bugsnag';
import * as SNS from 'lib/sns';
import * as utils from 'lib/utils';
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

async function createProperty(parent, input, context) {
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

  // Create a new entry in the DB
  const [propertyId] = await properties.create(propertyData);

  // Publish a new SNS message for the created property
  if (
    !propertyData.published_at ||
    moment(propertyData.published_at).isAfter('2020-01-01')
  ) {
    await SNS.publish({
      Message: JSON.stringify({
        ...propertyData,
        id: propertyId,
      }),
      MessageGroupId: propertyData.source,
      MessageStructure: 'string',
      TargetArn: utils.constructArn(
        context,
        process.env.PROPERTY_CREATION_SNS_TOPIC_NAME,
      ),
    });
  }

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
