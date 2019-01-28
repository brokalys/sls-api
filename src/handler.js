import { ApolloServer } from 'apollo-server-lambda';
import Rollbar from 'rollbar';

import getChartDataQuery from './schema/demo/get-chart-data.graphql';
import getMapDataQuery from './schema/demo/get-map-data.graphql';
import getRegionsQuery from './schema/demo/get-regions.graphql';
import getTableDataQuery from './schema/demo/get-table-data.graphql';
import schema from './schema/schema.graphql';
import { resolvers } from './resolvers';

const rollbar = new Rollbar({ accessToken: process.env.ROLLBAR_API_KEY });

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
    ],
  },
  formatError: (error) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(error);
      rollbar.error(error);
    }

    delete error.extensions.exception;
    return error;
  },
});

exports.graphqlHandler = server.createHandler({
  cors: {
    origin: '*',
  },
});
