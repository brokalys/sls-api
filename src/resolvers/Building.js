import { UserInputError } from 'apollo-server-lambda';
import validationSchema from './query/properties/validation';

export default {
  id: (building) => building.id,
  bounds: (building) => {
    const bounds =
      typeof building.bounds === 'string'
        ? JSON.parse(building.bounds)
        : building.bounds;
    return bounds[0].map(({ x, y }) => [x, y].join(' ')).join(', ');
  },
  properties: (building, input, { dataSources }) => {
    const validator = validationSchema.validate(input);

    // Validate input
    if (validator.error) {
      throw new UserInputError('Input validation failed', {
        details: validator.error.details,
      });
    }

    return dataSources.properties
      .loadByBuildingId(building.id, validator.value.filter)
      .then((results) => results.map(({ id }) => id));
  },
  vzd: (building) => building,
};
