import { createTestClient } from 'apollo-server-testing';

import { server } from 'handler';
import db from 'lib/db';

jest.mock('lib/db');

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

describe('Query: propertyExists', () => {
  let query;

  beforeEach(() => {
    const utils = createTestClient(server);
    query = utils.query;
  });

  test('checks if property exists with valid data and information in the DB', async () => {
    db.query.mockReturnValue([{ price: 1 }, { price: 2 }, { price: 3 }]);

    const response = await query({
      query: `
        query {
          propertyExists(
            source: "brokalys.com"
          )
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  test('checks if property exists with all parameters and information in the DB', async () => {
    db.query.mockReturnValue([{ price: 1 }, { price: 2 }, { price: 3 }]);

    const response = await query({
      query: `
        query {
          propertyExists(
            source: "brokalys.com"
            foreign_id: "123"
            url: "https://brokalys.com"
            created_at: "2019-01-01T00:10:20"
          )
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  test('checks if property exists with valid data and no information in the DB', async () => {
    db.query.mockReturnValue([]);

    const response = await query({
      query: `
        query {
          propertyExists(
            source: "brokalys.com"
          )
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  test('fails if input source is invalid', async () => {
    const response = await query({
      query: `
        query {
          propertyExists(
            source: "malformed url"
            foreign_id: "id123"
          )
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  test('fails if input foreign id is invalid', async () => {
    const response = await query({
      query: `
        query {
          propertyExists(
            source: "brokalys.com"
            foreign_id: "wrong ' 123"
          )
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });

  test('fails if input contains unrecognized field', async () => {
    const response = await query({
      query: `
        query {
          propertyExists(
            source: "brokalys.com"
            foreign_id: "123"
            unkown: "field"
          )
        }
      `,
    });

    expect(response).toMatchSnapshot();
  });
});
