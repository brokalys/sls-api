import { GraphQLDate } from 'graphql-iso-date';

import getMapData from './resolvers/get-map-data';
import getRegion from './resolvers/get-region';
import getRegions from './resolvers/get-regions';

exports.resolvers = {
  Date: GraphQLDate,
  Query: {
    getMapData,
    getRegion,
    getRegions,
  },
};
