import { UserInputError } from 'apollo-server-lambda';
import graphqlFields from 'graphql-fields';
import { discardSchema } from './properties/validation';

function discardPercentage(data, percentage = 0) {
  if (percentage === 0) {
    return data;
  }

  const itemCount = data.length;
  const discardStart = Math.floor((itemCount * percentage) / 2);

  return data
    .sort((a, b) => a - b)
    .splice(discardStart, itemCount - discardStart * 2);
}

function normalizeFields(info) {
  const fieldMap = {
    id: 'id',
    url: 'url',
    category: 'category',
    type: 'type',
    rent_type: ['type', 'rent_type'],
    content: 'content',
    images: 'images',
    price: 'price',
    calc_price_per_sqm: 'calc_price_per_sqm',
    rooms: 'rooms',
    area: 'area',
    floor: 'floor',
    lat: 'lat',
    lng: 'lng',
    published_at: 'published_at',
    foreign_id: 'foreign_id',
  };
  const fields = Object.keys(graphqlFields(info));

  return fields
    .map((key) => fieldMap[key])
    .flat()
    .filter((field) => !!field);
}

export default {
  results(ids, input, { dataSources }, info) {
    return dataSources.properties.loadMany(ids, normalizeFields(info));
  },

  summary(ids, input, { dataSources }) {
    return {
      count: ids.length,
      async price(params) {
        const discardValidator = discardSchema.validate(params);

        if (discardValidator.error) {
          throw new UserInputError('Input validation failed', {
            message: discardValidator.error.details,
          });
        }

        const data = await dataSources.properties.loadMany(ids, ['price']);
        const prices = discardPercentage(
          data.map(({ price }) => price).filter((price) => !!price),
          discardValidator.value.discard,
        );

        return prices;
      },
    };
  },
};
