import { AuthenticationError, UserInputError } from 'apollo-server-lambda';

import PropertiesDataSource from 'data-sources/properties';
import Bugsnag from 'lib/bugsnag';
import * as SQS from 'lib/sqs';
import createProperty from './create-property';

jest.mock('lib/bugsnag');
jest.mock('lib/sqs');
jest.mock('data-sources/properties');

const mockInput = {
  foreign_id: 'id_123',
  source: 'ss.lv',
  type: 'sell',
  category: 'apartment',
  url: 'https://example.com',
  price: 10000,
  lat: 56.95,
  lng: 24.0737,
};

const invokedFunctionArn = 'arn:aws:lambda:eu-west-1:123:pinger';

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
        invokedFunctionArn,
      },
    );

    expect(dataSources.properties.create).toHaveBeenCalledTimes(1);
    expect(SQS.sendMessage).toHaveBeenCalledTimes(1);
  });

  describe('getLocationClassificator', () => {
    test('successfully classifies the location', async () => {
      await createProperty(
        {},
        {
          input: JSON.stringify(mockInput),
        },
        {
          dataSources,
          isAuthenticated: true,
          invokedFunctionArn,
        },
      );

      expect(dataSources.properties.create).toHaveBeenCalledWith(
        expect.objectContaining({
          location_classificator: 'latvia-riga-agenskalns',
        }),
      );
    });

    test('does not classify location that is not recognized', async () => {
      await createProperty(
        {},
        {
          input: JSON.stringify({
            ...mockInput,
            lat: 56.11,
            lng: 30,
          }),
        },
        {
          dataSources,
          isAuthenticated: true,
          invokedFunctionArn,
        },
      );

      expect(dataSources.properties.create).toHaveBeenCalledWith(
        expect.objectContaining({
          location_classificator: undefined,
        }),
      );
    });

    test('does not classify properties without lat/lng', async () => {
      await createProperty(
        {},
        {
          input: JSON.stringify({
            ...mockInput,
            lat: undefined,
            lng: undefined,
          }),
        },
        {
          dataSources,
          isAuthenticated: true,
          invokedFunctionArn,
        },
      );

      expect(dataSources.properties.create).toHaveBeenCalledWith(
        expect.objectContaining({
          location_classificator: undefined,
        }),
      );
    });
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
            invokedFunctionArn,
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
            invokedFunctionArn,
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
            invokedFunctionArn,
          },
        ),
      ).rejects.toBeInstanceOf(Error);
    });
  });
});
