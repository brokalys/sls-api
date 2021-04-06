import { AuthenticationError, UserInputError } from 'apollo-server-lambda';

import BuildingsDataSource from 'data-sources/buildings';
import PropertiesDataSource from 'data-sources/properties';
import { hasPermission } from 'lib/permissions';
import buildings from './buildings';

jest.mock('data-sources/buildings');
jest.mock('data-sources/properties');
jest.mock('lib/permissions');

const VALID_BOUNDS =
  '56.944756215513316 24.09404948877113, 56.9404253703127 24.09404948877113, 56.9404253703127 24.086952363717725, 56.944756215513316 24.086952363717725, 56.944756215513316 24.09404948877113';

const MOCK_GQL_OPERATION = {
  operation: {
    selectionSet: {
      selections: [
        {
          selectionSet: {
            selections: [
              {
                name: {
                  value: 'properties',
                },
              },
            ],
          },
        },
      ],
    },
  },
};

describe('buildings', () => {
  let dataSources;

  beforeEach(() => {
    dataSources = {
      buildings: BuildingsDataSource,
      properties: PropertiesDataSource,
    };
  });

  afterEach(jest.clearAllMocks);

  test('successfully retrieves basic data', async () => {
    const data = await buildings(
      {},
      { bounds: VALID_BOUNDS },
      { isAuthenticated: true, dataSources },
      MOCK_GQL_OPERATION,
    );

    expect(data).toEqual([
      {
        id: 1,
        bounds: expect.any(String),
        properties: expect.any(Function),
      },
    ]);
    expect(data[0].properties()).toEqual({
      results: [
        {
          building_id: 1,
          price: 123,
        },
      ],
    });
  });

  test('successfully retrieves single result', async () => {
    const data = await buildings(
      {},
      { id: 1 },
      { isAuthenticated: true, dataSources },
      MOCK_GQL_OPERATION,
    );

    expect(data).toEqual([
      {
        id: 1,
        bounds: expect.any(String),
        properties: expect.any(Function),
      },
    ]);
    expect(data[0].properties()).toEqual({
      results: [
        {
          building_id: 1,
          price: 123,
        },
      ],
    });
  });

  test('does not make an unnecessary sql call to properties DB if the data is not necessary', async () => {
    const data = await buildings(
      {},
      { bounds: VALID_BOUNDS },
      { isAuthenticated: true, dataSources },
      {
        operation: {
          selectionSet: {
            selections: [
              {
                selectionSet: {
                  selections: [],
                },
              },
            ],
          },
        },
      },
    );

    expect(PropertiesDataSource.getInBuildings).not.toBeCalled();
  });

  describe('throws validation exception when', () => {
    test('no bounds provided', () => {
      expect(
        buildings({}, {}, { isAuthenticated: true }, MOCK_GQL_OPERATION),
      ).rejects.toBeInstanceOf(UserInputError);
    });

    test('too large bounds provided', () => {
      expect(
        buildings(
          {},
          {
            bounds:
              '57.0510741522279 24.34369621296768, 56.86735048784755 24.34369621296768, 56.86735048784755 23.842917061051175, 57.0510741522279 23.842917061051175, 57.0510741522279 24.34369621296768',
          },
          { isAuthenticated: true },
          MOCK_GQL_OPERATION,
        ),
      ).rejects.toBeInstanceOf(UserInputError);
    });
  });

  describe('throws auth exception when', () => {
    test('is not authenticated', () => {
      expect(
        buildings(
          {},
          { id: 1 },
          { isAuthenticated: false, dataSources },
          MOCK_GQL_OPERATION,
        ),
      ).rejects.toBeInstanceOf(AuthenticationError);
    });

    test('is authenticated, but not sufficient permissions', () => {
      hasPermission.mockReturnValue(false);

      expect(
        buildings(
          {},
          { id: 1 },
          { isAuthenticated: true, dataSources },
          MOCK_GQL_OPERATION,
        ),
      ).rejects.toBeInstanceOf(AuthenticationError);
    });
  });
});
