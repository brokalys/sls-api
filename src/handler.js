import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServer, ApolloError } from 'apollo-server-lambda';
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginUsageReportingDisabled,
} from 'apollo-server-core';
import Buildings from './data-sources/buildings';
import Land from './data-sources/land';
import Properties from './data-sources/properties';
import UserClassifieds from './data-sources/user-classifieds';
import VZDApartmentSales from './data-sources/vzd-apartment-sales';
import VZDHouseSales from './data-sources/vzd-house-sales';
import VZDLandSales from './data-sources/vzd-land-sales';
import loadUser from './lib/auth';
import authDirectiveTransformer from './lib/auth-directive';
import Bugsnag from './lib/bugsnag';
import mysql from './lib/db';
import typeDefs from './schema/schema.graphql';
import dbConfig from './db-config';
import resolvers from './resolvers';
import ApolloServerPluginCloudwatchReporting from './lib/apollo-serverless-plugin-cloudwatch-reporting';
import './knex-extensions';

const isDevMode = process.env.STAGE === 'dev';
const isStagingMode = process.env.STAGE === 'staging';
const isTestMode = process.env.NODE_ENV === 'test';

const bugsnagHandler = isTestMode
  ? (input) => input
  : Bugsnag.getPlugin('awsLambda').createHandler();

let schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
schema = authDirectiveTransformer(schema, 'auth');

export const server = new ApolloServer({
  schema,
  debug: isDevMode,
  dataSources: () => ({
    buildings: new Buildings(dbConfig),
    land: new Land(dbConfig),
    properties: new Properties(dbConfig),
    userClassifieds: new UserClassifieds(dbConfig),
    vzdApartmentSales: new VZDApartmentSales(dbConfig),
    vzdHouseSales: new VZDHouseSales(dbConfig),
    vzdLandSales: new VZDLandSales(dbConfig),
  }),
  context: async ({ event, req, request, context }) => {
    const { requestContext } = event ||
      req || { requestContext: { identity: {} } };

    return {
      user: await loadUser(requestContext.identity.apiKeyId),
      invokedFunctionArn: context ? context.invokedFunctionArn : '',
    };
  },
  formatError: (error) => {
    if (!isTestMode) {
      Bugsnag.notify(error, (event) => {
        event.addMetadata('error', error);
      });
    }

    if (
      (isDevMode && !isTestMode) ||
      error instanceof ApolloError ||
      error.originalError instanceof ApolloError ||
      error.originalError === undefined
    ) {
      if (error.message) {
        return {
          message: error.message,
          extensions: error.extensions,
        };
      }
      return error;
    }

    return new Error('An unexpected error occurred. Please try again later.');
  },
  plugins: [
    ...(isDevMode || isStagingMode
      ? [
          require('apollo-tracing').plugin(),
          ApolloServerPluginLandingPageGraphQLPlayground(),
        ]
      : [ApolloServerPluginLandingPageDisabled()]),
    // @todo: re-enable after rate limiting & metric request size issue is fixed
    // ...(!isDevMode ? [ApolloServerPluginCloudwatchReporting()] : []),
    ApolloServerPluginUsageReportingDisabled(),

    // Add request payload to the bugsnag error metadata so
    // it's easier to debug if there are errors
    {
      async requestDidStart({ request }) {
        Bugsnag.addMetadata('request', request);

        // Cleanup database connections at the end
        return {
          async willSendResponse() {
            await mysql.end();
          },
        };
      },
    },
  ],
});

exports.graphqlHandler = bugsnagHandler(server.createHandler());
