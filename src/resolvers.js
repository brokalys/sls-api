import { GraphQLDate } from 'graphql-iso-date';

import confirmPinger from './mutations/confirm-pinger';
import createPinger from './mutations/create-pinger';
import createProperty from './mutations/create-property';
import unsubscribePinger from './mutations/unsubscribe-pinger';
import getChartData from './resolvers/get-chart-data';
import getMapData from './resolvers/get-map-data';
import getPropertiesForPinger from './resolvers/get-properties-for-pinger';
import getRegion from './resolvers/get-region';
import getRegions from './resolvers/get-regions';
import properties from './resolvers/properties';
import propertyExists from './resolvers/property-exists';

export const resolvers = {
  Date: GraphQLDate,
  Query: {
    getChartData,
    getMapData,
    getPropertiesForPinger,
    getRegion,
    getRegions,
    properties,
    propertyExists,
  },
  Mutation: {
    confirmPinger,
    createPinger,
    createProperty,
    unsubscribePinger,
  },
};
