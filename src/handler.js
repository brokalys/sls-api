import { ApolloServer, ApolloError } from 'apollo-server-lambda';

import Properties from './data-sources/properties';
import Bugsnag from './lib/bugsnag';
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
  context: ({ event, req, context }) => {
    const { requestContext } = event ||
      req || { requestContext: { identity: {} } };

    return {
      isAuthenticated: !!requestContext.identity.apiKeyId, // Authorized via API Gateway
      invokedFunctionArn: context ? context.invokedFunctionArn : '',
    };
  },
  formatError: (error) => {
    if (
      error instanceof ApolloError ||
      error.originalError instanceof ApolloError ||
      error.originalError === undefined
    ) {
      return error;
    }

    if (process.env.NODE_ENV !== 'test') {
      console.log(error);
    }

    Bugsnag.notify(error);
    return new Error('An unexpected error occurred. Pleas try again later.');
  },
  plugins: [
    {
      requestDidStart(requestContext) {
        if (process.env.NODE_ENV !== 'test') {
          console.log('Request:', requestContext.request.query);
        }

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
