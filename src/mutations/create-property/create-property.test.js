import { AuthenticationError, UserInputError } from 'apollo-server-lambda';

import PropertiesDataSource from 'data-sources/properties';
import Bugsnag from 'lib/bugsnag';
import createProperty from './create-property';

jest.mock('lib/bugsnag');
jest.mock('data-sources/properties');

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

describe('createProperty', () => {
  let dataSources;

  beforeEach(() => {
    dataSources = {
      properties: PropertiesDataSource,
    };
  });

  afterEach(jest.clearAllMocks);

  test('successfully creates a pinger', async () => {
    await createProperty(
      {},
      {
        input: JSON.stringify(mockInput),
      },
      {
        dataSources,
        isAuthenticated: true,
      },
    );

    expect(dataSources.properties.create).toHaveBeenCalledTimes(1);
  });

  describe('fails creating when', () => {
    test('input validation fails', async () => {
      expect.assertions(2);
      await expect(
        createProperty(
          {},
          {
            input: JSON.stringify({
              ...mockInput,
              category: 'WRONG',
            }),
          },
          {
            dataSources,
            isAuthenticated: true,
          },
        ),
      ).rejects.toBeInstanceOf(UserInputError);
      expect(Bugsnag.notify).toBeCalled();
    });

    test('is not authenticated', async () => {
      await expect(
        createProperty(
          {},
          {
            input: JSON.stringify(mockInput),
          },
          {
            dataSources,
            isAuthenticated: false,
          },
        ),
      ).rejects.toBeInstanceOf(AuthenticationError);
    });

    test('inserting in DB fails', async () => {
      dataSources.properties.create.mockImplementation(() => {
        throw new Error('Something bad happened');
      });

      await expect(
        createProperty(
          {},
          {
            input: JSON.stringify(mockInput),
          },
          {
            dataSources,
            isAuthenticated: true,
          },
        ),
      ).rejects.toBeInstanceOf(Error);
    });
  });
});
