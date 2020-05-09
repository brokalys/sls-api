import { ApolloServer } from 'apollo-server-lambda';

import confirmPinger from './schema/demo/confirm-pinger.graphql';
import createPinger from './schema/demo/create-pinger.graphql';
import unsubscribePinger from './schema/demo/unsubscribe-pinger.graphql';
import getChartDataQuery from './schema/demo/get-chart-data.graphql';
import getMapDataQuery from './schema/demo/get-map-data.graphql';
import getMedianPrice from './schema/demo/get-median-price.graphql';
import getPingerStats from './schema/demo/get-pinger-stats.graphql';
import getRegionsQuery from './schema/demo/get-regions.graphql';
import getTableDataQuery from './schema/demo/get-table-data.graphql';
import schema from './schema/schema.graphql';
import { resolvers } from './resolvers';

const endpoint = process.env.STAGE === 'dev' ? '/dev/' : '/';

export const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  playground: {
    tabs: [
      {
        name: 'Get Regional Stats',
        endpoint,
        query: getRegionsQuery.loc.source.body,
      },
      {
        name: 'Get Chart Data',
        endpoint,
        query: getChartDataQuery.loc.source.body,
      },
      {
        name: 'Get Map Data',
        endpoint,
        query: getMapDataQuery.loc.source.body,
      },
      {
        name: 'Get Table Data',
        endpoint,
        query: getTableDataQuery.loc.source.body,
      },
      {
        name: 'Get stats for PINGER',
        endpoint,
        query: getPingerStats.loc.source.body,
      },
      {
        name: 'Create new PINGER',
        endpoint,
        query: createPinger.loc.source.body,
      },
      {
        name: 'Unsubscribe PINGER',
        endpoint,
        query: unsubscribePinger.loc.source.body,
      },
      {
        name: 'Confirm PINGER',
        endpoint,
        query: confirmPinger.loc.source.body,
      },
      {
        name: 'Get Median price for a region & month',
        endpoint,
        query: getMedianPrice.loc.source.body,
      },
    ],
  },
  formatError: (error) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(error);
    }

    if (error.extensions.exception && error.extensions.exception.stacktrace) {
      delete error.extensions.exception.stacktrace;
    }
    return error;
  },
});

exports.graphqlHandler = server.createHandler({
  cors: {
    origin: '*',
  },
});
