import { AuthenticationError, UserInputError } from 'apollo-server-lambda';
import numbers from 'numbers';

import {
  hasPermission,
  PERMISSION_GET_DETAILED_PROPERTY_DATA,
} from 'lib/permissions';
import validationSchema, { discardSchema } from './validation';

function getSelectedFields(info) {
  try {
    return info.operation.selectionSet.selections[0].selectionSet.selections[0].selectionSet.selections.map(
      (row) => row.name.value,
    );
  } catch (e) {
    // Do nothing
  }
}

function discardPercentage(data, amount = 0) {
  const itemCount = data.length;
  const discardStart = Math.floor((itemCount * amount) / 2);

  return data
    .sort((a, b) => a - b)
    .splice(discardStart, itemCount - discardStart * 2);
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

  return {
    results: async () => {
      if (
        !context.isAuthenticated ||
        !hasPermission(
          context.customerId,
          PERMISSION_GET_DETAILED_PROPERTY_DATA,
        )
      ) {
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

      const data = await properties.get(value.filter, value.limit, fields);
      return data.map((row) => ({
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
      price: async (params) => {
        const discardValidator = discardSchema.validate(params);

        if (discardValidator.error) {
          throw new UserInputError('Input validation failed', {
            message: discardValidator.error.details,
          });
        }

        const data = await properties.get(value.filter, null, ['price']);
        const prices = discardPercentage(
          data.map(({ price }) => price).filter((price) => !!price),
          discardValidator.value.discard,
        );

        return { prices };
      },
    },
  };
}

export default properties;
