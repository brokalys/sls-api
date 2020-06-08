import { ApolloServer } from 'apollo-server-lambda';

import { server } from './handler';

describe('handler', () => {
  test('creates ApolloServer instance', () => {
    expect(server).toBeInstanceOf(ApolloServer);
  });
});
