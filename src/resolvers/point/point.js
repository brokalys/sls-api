import { AuthenticationError, UserInputError } from 'apollo-server-lambda';
import { PERMISSION_READ_UNLIMITED_PROPERTY_DATA } from 'lib/permissions';
import validationSchema from './validation';

function properties(parent, input, context) {
  const validator = validationSchema.validate(input);

  // Validate input
  if (validator.error) {
    throw new UserInputError('Input validation failed', {
      details: validator.error.details,
    });
  }

  return {
    buildings: (parent, context) =>
      context.dataSources.buildings.getInPoint(
        validator.value.lat,
        validator.value.lng,
      ),
  };
}

export default properties;
