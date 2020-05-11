import { AuthenticationError, UserInputError } from 'apollo-server-lambda';

import Bugsnag from 'lib/bugsnag';
import Repository from 'lib/repository';
import createProperty from './create-property';

jest.mock('lib/bugsnag');
jest.mock('lib/repository');

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
  test('successfully creates a pinger', async () => {
    await createProperty(
      {},
      {
        input: JSON.stringify(mockInput),
      },
      {
        isAuthenticated: true,
      },
    );

    expect(Repository.createProperty).toHaveBeenCalledTimes(1);
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
            isAuthenticated: true,
          },
        ),
      ).rejects.toBeInstanceOf(UserInputError);
      expect(Bugsnag.notify).toBeCalled();
    });

    test('is not authenticated', async () => {
      expect.assertions(1);
      await expect(
        createProperty(
          {},
          {
            input: JSON.stringify(mockInput),
          },
          {
            isAuthenticated: false,
          },
        ),
      ).rejects.toBeInstanceOf(AuthenticationError);
    });

    test('inserting in DB fails', async () => {
      Repository.createProperty.mockImplementation(() => {
        throw new Error('Something bad happened');
      });

      expect.assertions(1);
      await expect(
        createProperty(
          {},
          {
            input: JSON.stringify(mockInput),
          },
          {
            isAuthenticated: true,
          },
        ),
      ).rejects.toBeInstanceOf(Error);
    });
  });
});
