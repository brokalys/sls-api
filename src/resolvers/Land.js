import { UserInputError } from 'apollo-server-lambda';
import validationSchema from './query/properties/validation';

export default {
  id: (land) => land.id,
  bounds: (land) => {
    const bounds =
      typeof land.bounds === 'string' ? JSON.parse(land.bounds) : land.bounds;
    return bounds[0].map(({ x, y }) => [x, y].join(' ')).join(', ');
  },
  properties: (land, input, { dataSources }) => {
    const validator = validationSchema.validate(input);

    // Validate input
    if (validator.error) {
      throw new UserInputError('Input validation failed', {
        details: validator.error.details,
      });
    }

    return dataSources.properties
      .loadByLandId(land.id, validator.value.filter)
      .then((results) => results.map(({ id }) => id));
  },
  vzd: (land) => land,
};
