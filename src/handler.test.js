import { ApolloServer } from 'apollo-server-lambda';
import { createTestClient } from 'apollo-server-testing';

import mysql from 'lib/db';
import { server } from './handler';

jest.mock('lib/db');

describe('handler', () => {
  afterEach(jest.resetAllMocks);

  test('creates ApolloServer instance', () => {
    expect(server).toBeInstanceOf(ApolloServer);
  });

  test('triggers `mysql.end` after every call', async () => {
    const utils = createTestClient(server);

    await utils.query({
      query: '{}',
    });

    expect(mysql.end).toBeCalled();
  });
});
