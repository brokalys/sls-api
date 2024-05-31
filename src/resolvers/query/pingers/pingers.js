import { AuthenticationError, UserInputError } from 'apollo-server-lambda';
import { PERMISSION_READ_PINGER_DATA } from 'lib/permissions';
import validationSchema from './validation';

function pingers(parent, input, context) {
  const validator = validationSchema.validate(input);

  // Validate input
  if (validator.error) {
    throw new UserInputError('Input validation failed', {
      details: validator.error.details,
    });
  }

  if (!context.user.hasRole(PERMISSION_READ_PINGER_DATA)) {
    throw new AuthenticationError(
      'You do not have sufficient permissions to query for pinger data.',
    );
  }

  return context.dataSources.pingers
    .get(validator.value, ['id_hash'])
    .then((results) => results.map(({ id_hash }) => id_hash));
}

export default pingers;
