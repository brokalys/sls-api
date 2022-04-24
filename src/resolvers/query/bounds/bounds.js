import { UserInputError } from 'apollo-server-lambda';
import graphqlFields from 'graphql-fields';
import validationSchema from './validation';

function hasExpensiveComputationFields(info) {
  const fields = graphqlFields(info);
  const { buildings = {} } = fields;

  if (buildings.properties || buildings.vzd) {
    return true;
  }

  return false;
}

export default function (root, input, context, info) {
  const isExpensiveOperation = hasExpensiveComputationFields(info);
  const validator = validationSchema({
    maxArea: isExpensiveOperation ? 0.0001 : 0.001,
  }).validate(input);

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
    land: (parent, context) =>
      context.dataSources.land.getInBounds(validator.value.bounds),
  };
}
