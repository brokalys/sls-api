import { GraphQLDate } from 'graphql-iso-date';

import confirmPinger from './mutations/confirm-pinger';
import createPinger from './mutations/create-pinger';
import unsubscribePinger from './mutations/unsubscribe-pinger';
import getChartData from './resolvers/get-chart-data';
import getMapData from './resolvers/get-map-data';
import getMedianPrice from './resolvers/get-median-price';
import getPingerStats from './resolvers/get-pinger-stats';
import getPropertiesForPinger from './resolvers/get-properties-for-pinger';
import getRegion from './resolvers/get-region';
import getRegions from './resolvers/get-regions';
import getTableData from './resolvers/get-table-data';

export const resolvers = {
  Date: GraphQLDate,
  Query: {
    getChartData,
    getMapData,
    getMedianPrice,
    getPingerStats,
    getPropertiesForPinger,
    getRegion,
    getRegions,
    getTableData,
  },
  Mutation: {
    confirmPinger,
    createPinger,
    unsubscribePinger,
  },
};
