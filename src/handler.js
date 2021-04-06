import { ApolloServer, ApolloError } from 'apollo-server-lambda';

import Buildings from './data-sources/buildings';
import Properties from './data-sources/properties';
import { getApiKey } from './lib/api-gateway';
import Bugsnag from './lib/bugsnag';
import mysql from './lib/db';
import schema from './schema/schema.graphql';
import resolvers from './resolvers';

const isDevMode = process.env.STAGE === 'dev';

async function getApiKeyCustomerId(id) {
  const { customerId } = await getApiKey(id);
  return customerId;
}

export const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  dataSources: () => ({
    buildings: new Buildings({ client: 'mysql' }),
    properties: new Properties({ client: 'mysql' }),
  }),
  tracing: isDevMode,
  playground: isDevMode,
  context: async ({ event, req, context }) => {
    const { requestContext } = event ||
      req || { requestContext: { identity: {} } };

    const isAuthenticated = !!requestContext.identity.apiKeyId;

    return {
      isAuthenticated, // Authorized via API Gateway
      customerId: isAuthenticated
        ? await getApiKeyCustomerId(requestContext.identity.apiKeyId)
        : null,
      invokedFunctionArn: context ? context.invokedFunctionArn : '',
    };
  },
  formatError: (error) => {
    if (
      (process.env.STAGE !== 'prod' && process.env.NODE_ENV !== 'test') ||
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
    return new Error('An unexpected error occurred. Please try again later.');
  },
  plugins: [
    {
      requestDidStart(requestContext) {
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
