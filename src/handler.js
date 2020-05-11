import { ApolloServer } from 'apollo-server-lambda';

import mysql from 'lib/db';
import confirmPinger from './schema/demo/confirm-pinger.graphql';
import createPinger from './schema/demo/create-pinger.graphql';
import unsubscribePinger from './schema/demo/unsubscribe-pinger.graphql';
import getChartDataQuery from './schema/demo/get-chart-data.graphql';
import getMapDataQuery from './schema/demo/get-map-data.graphql';
import getMedianPrice from './schema/demo/get-median-price.graphql';
import getPingerStats from './schema/demo/get-pinger-stats.graphql';
import getPropertiesForPinger from './schema/demo/get-properties-for-pinger.graphql';
import getRegionsQuery from './schema/demo/get-regions.graphql';
import getTableDataQuery from './schema/demo/get-table-data.graphql';
import schema from './schema/schema.graphql';
import { resolvers } from './resolvers';

const endpoint = process.env.STAGE === 'dev' ? '/dev/' : '/';
const headers =
  process.env.STAGE === 'dev'
    ? {
        Authorization: process.env.BROKALYS_PRIVATE_KEY,
      }
    : {};

export const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  playground: {
    tabs: [
      {
        name: 'Get Regional Stats',
        endpoint,
        query: getRegionsQuery.loc.source.body,
        headers,
      },
      {
        name: 'Get Chart Data',
        endpoint,
        query: getChartDataQuery.loc.source.body,
        headers,
      },
      {
        name: 'Get Map Data',
        endpoint,
        query: getMapDataQuery.loc.source.body,
        headers,
      },
      {
        name: 'Get Table Data',
        endpoint,
        query: getTableDataQuery.loc.source.body,
        headers,
      },
      {
        name: 'Get stats for PINGER',
        endpoint,
        query: getPingerStats.loc.source.body,
        headers,
      },
      {
        name: 'Create new PINGER',
        endpoint,
        query: createPinger.loc.source.body,
        headers,
      },
      {
        name: 'Unsubscribe PINGER',
        endpoint,
        query: unsubscribePinger.loc.source.body,
        headers,
      },
      {
        name: 'Confirm PINGER',
        endpoint,
        query: confirmPinger.loc.source.body,
        headers,
      },
      {
        name: 'Get Median price for a region & month',
        endpoint,
        query: getMedianPrice.loc.source.body,
        headers,
      },
      {
        name: 'Get properties for pinger',
        endpoint,
        query: getPropertiesForPinger.loc.source.body,
        headers,
      },
    ],
  },
  context: ({ event, req }) => {
    const { headers } = event || req || { headers: {} };
    return {
      isAuthenticated:
        headers.Authorization === process.env.BROKALYS_PRIVATE_KEY,
    };
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
  plugins: [
    {
      requestDidStart() {
        return {
          willSendResponse() {
            return mysql.end();
          },
        };
      },
    },
  ],
});

exports.graphqlHandler = server.createHandler({
  cors: {
    origin: '*',
  },
});
