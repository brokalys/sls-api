import { UserInputError } from 'apollo-server-lambda';
import moment from 'moment';
import Bugsnag from 'lib/bugsnag';
import getLocationClassificator from 'lib/location-classificator';
import * as SNS from 'lib/sns';
import * as utils from 'lib/utils';
import validationSchema from './validation';

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
    rent_type: value.rent_type === 'unknown' ? undefined : value.rent_type,
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
    return Number(obj.price_per_sqm.toFixed(2));
  }

  if (obj.area > 0 && obj.area_measurement === 'm2' && obj.price > 0) {
    return Number((obj.price / obj.area).toFixed(2));
  }
}

export default createProperty;
