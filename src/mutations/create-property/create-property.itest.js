import { createTestClient } from 'apollo-server-testing';
import { server } from 'handler';
import { authenticateAs } from 'helpers';
import Bugsnag from 'lib/bugsnag';
import db from 'db-config';

jest.mock('lib/bugsnag');
jest.mock('lib/sns');

const mockInput = {
  foreign_id: 'id_123',
  source: 'ss.lv',
  type: 'sell',
  category: 'apartment',
  url: 'https://example.com',
  price: 10000,
  lat: 56.11,
  lng: 55.111112,
  cadastre_number: '01000280009',
};

const { mutate } = createTestClient(server);

describe('Mutation: createProperty', () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  test('creates a property with valid data', async () => {
    authenticateAs('slsCrawler', server);

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

  test('fails creating a pinger if input validation fails', async () => {
    authenticateAs('slsCrawler', server);

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
