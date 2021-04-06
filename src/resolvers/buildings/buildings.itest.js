import { createTestClient } from 'apollo-server-testing';

import { server } from 'handler';
import db from 'lib/db';
import Bugsnag from 'lib/bugsnag';

jest.mock('lib/bugsnag');
jest.mock('lib/db');

describe('Query: buildings', () => {
  let run;

  beforeEach(() => {
    const utils = createTestClient(server);
    run = utils.query;
  });

  afterEach(jest.resetAllMocks);

  test('successfully retrieves building data', async () => {
    db.query.mockReturnValueOnce([
      {
        id: 1,
        bounds: [
          [
            { x: 56.992294, y: 24.136619 },
            { x: 56.976394, y: 23.99579 },
            { x: 56.992294, y: 24.136619 },
          ],
        ],
      },
      {
        id: 2,
        bounds: [
          [
            { x: 56.992294, y: 24.136619 },
            { x: 56.976394, y: 23.99579 },
            { x: 56.992294, y: 24.136619 },
          ],
        ],
      },
    ]);

    const response = await run({
      query: `
        query GetBuildings($bounds: String!) {
          buildings(bounds: $bounds) {
            id
            bounds
          }
        }
      `,
      variables: {
        bounds:
          '56.944756215513316 24.09404948877113, 56.9404253703127 24.09404948877113, 56.9404253703127 24.086952363717725, 56.944756215513316 24.086952363717725, 56.944756215513316 24.09404948877113',
      },
    });

    expect(response).toMatchSnapshot();
  });

  test('successfully retrieves single building', async () => {
    db.query.mockReturnValueOnce([
      {
        id: 1,
        bounds: [
          [
            { x: 56.992294, y: 24.136619 },
            { x: 56.976394, y: 23.99579 },
            { x: 56.992294, y: 24.136619 },
          ],
        ],
      },
    ]);

    const response = await run({
      query: `
        query GetBuilding($id: Int!) {
          buildings(id: $id) {
            id
          }
        }
      `,
      variables: {
        id: 1,
      },
    });

    expect(response).toMatchSnapshot();
  });

  // @todo: passing headers to integration tests is currently not possible..
  // @see https://github.com/apollographql/apollo-server/issues/2277
  xtest('successfully returns nothing if there are no buildings in this bound', async () => {
    db.query.mockReturnValueOnce([]);

    const response = await run({
      query: `
        query GetBuildings($bounds: String!) {
          buildings(bounds: $bounds) {
            id
            properties {
              results {
                price
              }
            }
          }
        }
      `,
      variables: {
        bounds:
          '56.944756215513316 24.09404948877113, 56.9404253703127 24.09404948877113, 56.9404253703127 24.086952363717725, 56.944756215513316 24.086952363717725, 56.944756215513316 24.09404948877113',
      },
    });

    expect(response).toMatchSnapshot();
  });

  // @todo: passing headers to integration tests is currently not possible..
  // @see https://github.com/apollographql/apollo-server/issues/2277
  xtest('successfully retrieves building an property information', async () => {
    db.query.mockReturnValueOnce([
      {
        id: 1,
        bounds: [
          [
            { x: 56.992294, y: 24.136619 },
            { x: 56.976394, y: 23.99579 },
            { x: 56.992294, y: 24.136619 },
          ],
        ],
      },
      {
        id: 2,
        bounds: [
          [
            { x: 56.992294, y: 24.136619 },
            { x: 56.976394, y: 23.99579 },
            { x: 56.992294, y: 24.136619 },
          ],
        ],
      },
      {
        id: 3,
        bounds: [
          [
            { x: 56.992294, y: 24.136619 },
            { x: 56.976394, y: 23.99579 },
            { x: 56.992294, y: 24.136619 },
          ],
        ],
      },
    ]);
    db.query.mockReturnValueOnce([
      { price: 1, building_id: 1 },
      { price: 2, building_id: 1 },
      { price: 3, building_id: 2 },
    ]);

    const response = await run({
      query: `
        query GetBuildingsAndProperties($bounds: String!) {
          buildings(bounds: $bounds) {
            id
            properties {
              results {
                price
              }
            }
          }
        }
      `,
      variables: {
        bounds:
          '56.944756215513316 24.09404948877113, 56.9404253703127 24.09404948877113, 56.9404253703127 24.086952363717725, 56.944756215513316 24.086952363717725, 56.944756215513316 24.09404948877113',
      },
    });

    expect(response).toMatchSnapshot();
  });

  test('throws a validation exception if no bounds filter provided', async () => {
    const response = await run({
      query: `
        {
          buildings {
            id
          }
        }
      `,
    });

    expect(response).toMatchSnapshot();
    expect(db.query).not.toBeCalled();
  });

  test('throws a validation exception if bounds filter has too large location', async () => {
    const response = await run({
      query: `
        query GetBuildingsAndProperties($bounds: String!) {
          buildings(bounds: $bounds) {
            id
          }
        }
      `,
      variables: {
        bounds:
          '57.0510741522279 24.34369621296768, 56.86735048784755 24.34369621296768, 56.86735048784755 23.842917061051175, 57.0510741522279 23.842917061051175, 57.0510741522279 24.34369621296768',
      },
    });

    expect(response).toMatchSnapshot();
    expect(db.query).not.toBeCalled();
  });

  test('throws an authentication error if trying to retrieve results without authorizing', async () => {
    const response = await run({
      query: `
        query GetBuildingsAndProperties($bounds: String!) {
          buildings(bounds: $bounds) {
            id
            properties {
              results {
                price
              }
            }
          }
        }
      `,
      variables: {
        bounds:
          '56.944756215513316 24.09404948877113, 56.9404253703127 24.09404948877113, 56.9404253703127 24.086952363717725, 56.944756215513316 24.086952363717725, 56.944756215513316 24.09404948877113',
      },
    });

    expect(Bugsnag.notify).not.toBeCalled();
    expect(response.errors).toEqual([
      expect.objectContaining({
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      }),
    ]);
  });
});
