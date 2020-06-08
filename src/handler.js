import { ApolloServer } from 'apollo-server-lambda';
import { SqlCache } from 'apollo-server-cache-sql';

import Properties from './data-sources/properties';
import mysql from './lib/db';
import schema from './schema/schema.graphql';
import resolvers from './resolvers';

const isDevMode = process.env.STAGE === 'dev';

const cache = new SqlCache({
  client: mysql,
  databaseName: process.env.DB_CACHE_DATABASE,
  tableName: 'cache',
});

export const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  dataSources: () => ({
    properties: new Properties({ client: 'mysql' }),
  }),
  cache,
  tracing: isDevMode,
  playground: isDevMode,
  context: ({ event, req }) => {
    const { headers, requestContext } = event ||
      req || { headers: {}, requestContext: { identity: {} } };

    return {
      cacheEnabled: headers['Cache-Control'] !== 'no-cache',
      isAuthenticated:
        headers.Authorization === process.env.BROKALYS_PRIVATE_KEY ||
        !!requestContext.identity.apiKeyId, // Authorized via API Gateway
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
