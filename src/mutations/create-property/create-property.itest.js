import { createTestClient } from 'apollo-server-testing';

import { server } from 'handler';
import Bugsnag from 'lib/bugsnag';
import db from 'lib/db';

jest.mock('lib/bugsnag');
jest.mock('lib/db');
jest.mock('lib/sqs');

const mockInput = {
  foreign_id: 'id_123',
  source: 'ss.lv',
  type: 'sell',
  category: 'apartment',
  url: 'https://example.com',
  price: 10000,
  lat: 56.11,
  lng: 55.111112,
};

describe('Mutation: createProperty', () => {
  let mutate;

  beforeEach(() => {
    const utils = createTestClient(server);
    mutate = utils.mutate;
  });

  // @todo: passing headers to integration tests is currently not possible..
  // @see https://github.com/apollographql/apollo-server/issues/2277
  xtest('creates a property with valid data', async () => {
    const response = await mutate({
      mutation: `
        mutation {
          createProperty(
            input: ${JSON.stringify(JSON.stringify(mockInput))}
          )
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  // @todo: passing headers to integration tests is currently not possible..
  // @see https://github.com/apollographql/apollo-server/issues/2277
  xtest('fails creating a pinger if input validation fails', async () => {
    const response = await mutate({
      mutation: `
        mutation {
          createProperty(
            input: ${JSON.stringify(
              JSON.stringify({
                ...mockInput,
                type: 'WRONG',
              }),
            )}
          )
        }
      `,
    });

    expect(response).toMatchSnapshot();
    expect(Bugsnag.notify).toBeCalled();
  });

  test('fails creating a pinger if is not authenticated', async () => {
    const response = await mutate({
      mutation: `
        mutation {
          createProperty(
            input: ${JSON.stringify(JSON.stringify(mockInput))}
          )
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });
});
