import { ApolloServer, ApolloError } from 'apollo-server-lambda';
import {
  ApolloServerPluginInlineTrace,
  ApolloServerPluginInlineTraceDisabled,
  ApolloServerPluginUsageReporting,
  ApolloServerPluginUsageReportingDisabled,
} from 'apollo-server-core';
import Buildings from './data-sources/buildings';
import Properties from './data-sources/properties';
import loadUser from './lib/auth';
import AuhtDirective from './lib/auth-directive';
import Bugsnag from './lib/bugsnag';
import mysql from './lib/db';
import schema from './schema/schema.graphql';
import dbConfig from './db-config';
import resolvers from './resolvers';
import './knex-extensions';

const isDevMode = process.env.STAGE === 'dev';
const isTestMode = process.env.NODE_ENV === 'test';

export const server = new ApolloServer({
  typeDefs: schema,
  schemaDirectives: {
    auth: AuhtDirective,
  },
  resolvers,
  dataSources: () => ({
    buildings: new Buildings(dbConfig),
    properties: new Properties(dbConfig),
  }),
  tracing: isDevMode,
  playground: isDevMode,
  context: async ({ event, req, request, context }) => {
    const { requestContext } = event ||
      req || { requestContext: { identity: {} } };

    return {
      user: await loadUser(requestContext.identity.apiKeyId),
      invokedFunctionArn: context ? context.invokedFunctionArn : '',
    };
  },
  formatError: (error) => {
    if (
      (isDevMode && !isTestMode) ||
      error instanceof ApolloError ||
      error.originalError instanceof ApolloError ||
      error.originalError === undefined
    ) {
      return error;
    }

    if (!isTestMode) {
      console.log(error);
      Bugsnag.notify(error);
    }

    return new Error('An unexpected error occurred. Please try again later.');
  },
  plugins: [
    isDevMode
      ? ApolloServerPluginInlineTrace()
      : ApolloServerPluginInlineTraceDisabled(),
    !isDevMode && !isTestMode
      ? ApolloServerPluginUsageReporting({
          sendVariableValues: {
            exceptNames: ['email', 'unsubscribe_key'],
          },
          logger: {
            debug: () => {},
            info: () => {},
            warn: console.warn,
            error: console.error,
          },
          generateClientInfo: ({ context, request }) => {
            const headers = request.http && request.http.headers;
            const clientVersion =
              headers['apollographql-client-version'] || '1.0.0';

            if (!context.user) {
              return {
                clientName: 'Unauthorized',
                clientVersion,
              };
            }

            return {
              clientName: context.user.apiKey.name,
              clientVersion,
            };
          },
        })
      : ApolloServerPluginUsageReportingDisabled(),
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
