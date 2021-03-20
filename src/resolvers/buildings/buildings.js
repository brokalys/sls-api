import { AuthenticationError, UserInputError } from 'apollo-server-lambda';
import numbers from 'numbers';

import validationSchema from './validation';

export default async function (parent, input, context, info) {
  const validator = validationSchema.validate(input);

  // Validate input
  if (validator.error) {
    throw new UserInputError('Input validation failed', {
      details: validator.error.details,
    });
  }

  const { buildings, properties } = context.dataSources;
  const { value } = validator;

  const hasSelectedProperties = !!info.operation.selectionSet.selections[0].selectionSet.selections.find(
    (row) => row.name.value === 'properties',
  );

  const buildingData = await buildings.getInBounds(value.bounds);
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
