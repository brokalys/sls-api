import { ApolloServer } from 'apollo-server-lambda';

import schema from './schema/schema.graphql';
import resolvers from './resolvers';

const isDevMode = process.env.STAGE === 'dev';

export const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  tracing: isDevMode,
  playground: isDevMode,
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
