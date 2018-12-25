import { ApolloServer } from 'apollo-server-lambda';
import schema from './schema/schema.graphql';
import { resolvers } from './resolvers';

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
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
