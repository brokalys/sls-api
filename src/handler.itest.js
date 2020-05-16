import { createTestClient } from 'apollo-server-testing';

import { server } from 'handler';
import db from 'lib/db';

jest.mock('lib/db');

describe('Mutation', () => {
  let mutate;

  beforeEach(() => {
    const utils = createTestClient(server);
    mutate = utils.mutate;
  });

  describe('confirmPinger', () => {
    test('confirms an existing pinger', async () => {
      db.query.mockImplementation(() => ({
        affectedRows: 1,
      }));

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
      db.query.mockImplementation(() => ({
        affectedRows: 0,
      }));

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

  describe('unsubscribePinger', () => {
    test('unsubscribes an existing pinger', async () => {
      db.query.mockImplementation(() => ({
        affectedRows: 1,
      }));

      const response = await mutate({
        mutation: `
          mutation {
            unsubscribePinger(
              id: 1
              unsubscribe_key: "test_123"
            )
          }
        `,
      });

      expect(response).toMatchSnapshot();
    });

    test('unsubscribes all pingers of an email', async () => {
      db.query.mockReturnValueOnce([
        {
          email: 'test@brokalys.com',
        },
      ]);
      db.query.mockReturnValueOnce({
        affectedRows: 1,
      });

      const response = await mutate({
        mutation: `
          mutation {
            unsubscribePinger(
              id: 1
              unsubscribe_key: "test_123"
              all: true
            )
          }
        `,
      });

      expect(response).toMatchSnapshot();
    });

    test('fails unsubscribing a pinger with wrong credentials, but still responds with status = true', async () => {
      db.query.mockImplementation(() => ({
        affectedRows: 0,
      }));

      const response = await mutate({
        mutation: `
          mutation {
            unsubscribePinger(
              id: 1
              unsubscribe_key: "wrong_credentials"
            )
          }
        `,
      });

      expect(response).toMatchSnapshot();
    });

    test('fails unsubscribing with missing `id`', async () => {
      const response = await mutate({
        mutation: `
          mutation {
            unsubscribePinger(
              unsubscribe_key: "test_123"
            )
          }
        `,
      });

      expect(response).toMatchSnapshot();
    });

    test('fails unsubscribing with missing `unsubscribe_key`', async () => {
      const response = await mutate({
        mutation: `
          mutation {
            unsubscribePinger(
              id: 1
            )
          }
        `,
      });

      expect(response).toMatchSnapshot();
    });
  });
});
