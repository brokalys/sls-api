import { ApolloServer } from 'apollo-server-lambda';
import Rollbar from 'rollbar';

import defaultQuery from './schema/default-query.graphql';
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
        query: defaultQuery.loc.source.body,
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
