import { ApolloServer } from 'apollo-server-lambda';

import createPinger from './schema/demo/create-pinger.graphql';
import getChartDataQuery from './schema/demo/get-chart-data.graphql';
import getMapDataQuery from './schema/demo/get-map-data.graphql';
import getRegionsQuery from './schema/demo/get-regions.graphql';
import getTableDataQuery from './schema/demo/get-table-data.graphql';
import schema from './schema/schema.graphql';
import { resolvers } from './resolvers';

export const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  playground: {
    tabs: [
      {
        name: 'Get Regional Stats',
        endpoint: '/',
        query: getRegionsQuery.loc.source.body,
      },
      {
        name: 'Get Chart Data',
        endpoint: '/',
        query: getChartDataQuery.loc.source.body,
      },
      {
        name: 'Get Map Data',
        endpoint: '/',
        query: getMapDataQuery.loc.source.body,
      },
      {
        name: 'Get Table Data',
        endpoint: '/',
        query: getTableDataQuery.loc.source.body,
      },
      {
        name: 'Create new PINGER',
        endpoint: '/',
        query: createPinger.loc.source.body,
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
