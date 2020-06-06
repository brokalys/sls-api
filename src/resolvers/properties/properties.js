import { AuthenticationError, UserInputError } from 'apollo-server-lambda';
import numbers from 'numbers';

import validationSchema from './validation';

function getSelectedFields(info) {
  try {
    return info.operation.selectionSet.selections[0].selectionSet.selections[0].selectionSet.selections.map(
      (row) => row.name.value,
    );
  } catch (e) {
    // Do nothing
  }
}

async function properties(parent, input, context, info) {
  const validator = validationSchema.validate(input);

  // Validate input
  if (validator.error) {
    throw new UserInputError('Input validation failed', {
      details: validator.error.details,
    });
  }

  const { properties } = context.dataSources;
  const { value } = validator;

  properties.setCacheControl(context.cacheEnabled);

  return {
    results: () => {
      if (!context.isAuthenticated) {
        throw new AuthenticationError();
      }

      const fields = getSelectedFields(info);

      // If we want to retrieve `price_per_sqm` - some additional calculations
      // might need to be performed due to the data not always existing (but
      // area + price might exist from which we can easily calculate price/sqm)
      if (fields && fields.includes('price_per_sqm')) {
        if (!fields.includes('price')) fields.push('price');
        if (!fields.includes('area')) fields.push('area');
      }

      return properties.get(value.filter, value.limit, fields).map((row) => ({
        ...row,

        // if price/sqm is not set - attempt to calculate it
        price_per_sqm:
          row.area && row.price && !row.price_per_sqm
            ? row.price / row.area
            : row.price_per_sqm,
      }));
    },
    summary: {
      count: () => properties.getCount(value.filter),
      price: async () => {
        const data = await properties.get(value.filter, null, ['price']);
        const prices = data
          .map(({ price }) => price)
          .filter((price) => price >= 1);

        return {
          min: parseInt(numbers.basic.min(prices), 10) || null,
          max: parseInt(numbers.basic.max(prices), 10) || null,
          mean: parseInt(numbers.statistic.mean(prices), 10) || null,
          median: parseInt(numbers.statistic.median(prices), 10) || null,
          mode: parseInt(numbers.statistic.mode(prices), 10) || null,
          standardDev:
            parseInt(numbers.statistic.standardDev(prices), 10) || null,
        };
      },
    },
  };
}

export default properties;
