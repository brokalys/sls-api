import { ApolloServer } from 'apollo-server-lambda';

import { server } from './handler';

jest.mock('apollo-server-cache-sql');

describe('handler', () => {
  test('creates ApolloServer instance', () => {
    expect(server).toBeInstanceOf(ApolloServer);
  });
});
