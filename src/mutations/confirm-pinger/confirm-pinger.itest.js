import { createTestClient } from 'apollo-server-testing';

import { server } from 'handler';
import db from 'lib/db';

jest.mock('lib/db');

describe('Mutation: createProperty', () => {
  let mutate;

  beforeEach(() => {
    process.env.BROKALYS_PRIVATE_KEY = 'PRIVATE_KEY';

    const utils = createTestClient(server);
    mutate = utils.mutate;
  });

  test('confirms an existing pinger', async () => {
    db.query.mockReturnValueOnce({
      affectedRows: 1,
    });

    const response = await mutate({
      mutation: `
        mutation {
          confirmPinger(
            id: 1
            confirm_key: "test_123"
          )
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  test('fails confirming a pinger with wrong credentials, but still responds with status = true', async () => {
    db.query.mockReturnValueOnce({
      affectedRows: 0,
    });

    const response = await mutate({
      mutation: `
        mutation {
          confirmPinger(
            id: 1
            confirm_key: "wrong_credentials"
          )
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  test('fails confirming with missing `id`', async () => {
    const response = await mutate({
      mutation: `
        mutation {
          confirmPinger(
            confirm_key: "test_123"
          )
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  test('fails confirming with missing `confirm_key`', async () => {
    const response = await mutate({
      mutation: `
        mutation {
          confirmPinger(
            id: 1
          )
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });
});
