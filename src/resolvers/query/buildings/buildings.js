import { AuthenticationError, UserInputError } from 'apollo-server-lambda';
import { PERMISSION_READ_UNLIMITED_SALE_DATA } from 'lib/permissions';
import validationSchema from './validation';

export default function (parent, input, context) {
  const validator = validationSchema.validate(input);

  // Validate input
  if (validator.error) {
    throw new UserInputError('Input validation failed', {
      details: validator.error.details,
    });
  }

  const { limit } = validator.value;

  // Only specific customers can access unlimited properties
  if (!limit && !context.user.hasRole(PERMISSION_READ_UNLIMITED_SALE_DATA)) {
    throw new AuthenticationError(
      'You do not have sufficient permissions to query for unlimited results. Please provide a limit.',
    );
  }

  return context.dataSources.buildings.get(validator.value.filter, limit);
}
