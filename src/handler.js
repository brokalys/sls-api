import { ApolloServer } from 'apollo-server-lambda';

import Properties from './data-sources/properties';
import mysql from './lib/db';
import schema from './schema/schema.graphql';
import resolvers from './resolvers';

const isDevMode = process.env.STAGE === 'dev';

export const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  dataSources: () => ({
    properties: new Properties({ client: 'mysql' }),
  }),
  tracing: isDevMode,
  playground: isDevMode,
  context: ({ event, req }) => {
    const { requestContext } = event ||
      req || { requestContext: { identity: {} } };

    return {
      isAuthenticated: !!requestContext.identity.apiKeyId, // Authorized via API Gateway
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
