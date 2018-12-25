import { ApolloServer } from 'apollo-server-lambda';
import defaultQuery from './schema/default-query.graphql';
import schema from './schema/schema.graphql';
import { resolvers } from './resolvers';

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  playground: {
    tabs: [
      {
        name: 'Get Regional Stats',
        endpoint: '/',
        query: defaultQuery,
      },
    ],
  },
  formatError: (error) => {
    console.log(error);

    delete error.extensions.exception;
    return error;
  },
});

exports.graphqlHandler = server.createHandler({
  cors: {
    origin: '*',
  },
});
