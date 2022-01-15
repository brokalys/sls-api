import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServer, ApolloError } from 'apollo-server-lambda';
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginUsageReportingDisabled,
} from 'apollo-server-core';
import Buildings from './data-sources/buildings';
import Properties from './data-sources/properties';
import UserClassifieds from './data-sources/user-classifieds';
import VZDApartmentSales from './data-sources/vzd-apartment-sales';
import loadUser from './lib/auth';
import authDirectiveTransformer from './lib/auth-directive';
import Bugsnag from './lib/bugsnag';
import typeDefs from './schema/schema.graphql';
import dbConfig from './db-config';
import resolvers from './resolvers';
import ApolloServerPluginCloudwatchReporting from './lib/apollo-serverless-plugin-cloudwatch-reporting';
import './knex-extensions';

const isDevMode = process.env.STAGE === 'dev';
const isTestMode = process.env.NODE_ENV === 'test';

let schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
schema = authDirectiveTransformer(schema, 'auth');

export const server = new ApolloServer({
  schema,
  dataSources: () => ({
    buildings: new Buildings(dbConfig),
    properties: new Properties(dbConfig),
    userClassifieds: new UserClassifieds(dbConfig),
    vzdApartmentSales: new VZDApartmentSales(dbConfig),
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
    ...(isDevMode
      ? [
          require('apollo-tracing').plugin(),
          ApolloServerPluginCloudwatchReporting(),
        ]
      : []),
    isDevMode
      ? ApolloServerPluginLandingPageGraphQLPlayground()
      : ApolloServerPluginLandingPageDisabled(),
    ApolloServerPluginUsageReportingDisabled(),
  ],
});

exports.graphqlHandler = server.createHandler({
  cors: {
    origin: '*',
  },
});
