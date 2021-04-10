import { UserInputError } from 'apollo-server-lambda';
import validationSchema from './validation';

export default function (parent, input, context) {
  const validator = validationSchema.validate(input);

  // Validate input
  if (validator.error) {
    throw new UserInputError('Input validation failed', {
      details: validator.error.details,
    });
  }

  return context.dataSources.buildings.getById(validator.value.id);
}
