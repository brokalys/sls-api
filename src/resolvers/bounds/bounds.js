import { UserInputError } from 'apollo-server-lambda';
import validationSchema from './validation';

export default function (root, input) {
  const validator = validationSchema.validate(input);

  // Validate input
  if (validator.error) {
    throw new UserInputError('Input validation failed', {
      details: validator.error.details,
    });
  }

  return {
    bounds: validator.value.bounds,
    buildings: (parent, context) =>
      context.dataSources.buildings.getInBounds(validator.value.bounds),
  };
}
