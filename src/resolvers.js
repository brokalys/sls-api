import { GraphQLDate } from 'graphql-iso-date';

import getRegion from './resolvers/get-region';
import getRegions from './resolvers/get-regions';

exports.resolvers = {
  Date: GraphQLDate,
  Query: {
    getRegions,
    getRegion,
  },
};
