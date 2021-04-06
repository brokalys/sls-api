import { AuthenticationError, UserInputError } from 'apollo-server-lambda';
import numbers from 'numbers';

import {
  hasPermission,
  PERMISSION_GET_BASIC_PROPERTY_DATA,
} from 'lib/permissions';
import validationSchema from './validation';

export default async function (parent, input, context, info) {
  const hasSelectedProperties = !!info.operation.selectionSet.selections[0].selectionSet.selections.find(
    (row) => row.name.value === 'properties',
  );

  if (
    hasSelectedProperties &&
    (!context.isAuthenticated ||
      !hasPermission(context.customerId, PERMISSION_GET_BASIC_PROPERTY_DATA))
  ) {
    throw new AuthenticationError();
  }

  const validator = validationSchema.validate(input);

  // Validate input
  if (validator.error) {
    throw new UserInputError('Input validation failed', {
      details: validator.error.details,
    });
  }

  const { buildings, properties } = context.dataSources;
  const { value } = validator;

  const buildingData = await (value.id
    ? buildings.getById(value.id)
    : buildings.getInBounds(value.bounds));
  const propertyData = hasSelectedProperties
    ? await properties.getInBuildings(buildingData.map(({ id }) => id))
    : {};

  return buildingData.map((building) => ({
    id: building.id,
    bounds: building.bounds[0].map(({ x, y }) => [x, y].join(' ')).join(', '),
    properties: () => ({
      results: propertyData[building.id],
    }),
  }));
}
