import { ApolloServer } from 'apollo-server-lambda';

import Bugsnag from 'lib/bugsnag';
import mysql from 'lib/db';
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
  playground: process.env.STAGE === 'dev',
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
      Bugsnag.addMetadata('error', error);
      Bugsnag.notify(error);
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
