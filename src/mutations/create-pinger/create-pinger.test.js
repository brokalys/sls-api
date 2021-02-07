import { UserInputError } from 'apollo-server-lambda';

import Repository from 'lib/repository';
import createPinger from './create-pinger';

jest.mock('lib/repository');

describe('createPinger', () => {
  test('successfully creates a pinger', async () => {
    await createPinger(
      {},
      {
        email: 'demo@email.com',
        category: 'APARTMENT',
        type: 'SELL',
        price_min: 10000,
        price_max: 100000,
        region:
          '56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176, 56.992294 24.136619',
      },
    );

    expect(Repository.createPinger).toHaveBeenCalledTimes(1);
  });

  test('successfully creates a pinger with empty comments field', async () => {
    await createPinger(
      {},
      {
        email: 'demo@email.com',
        category: 'APARTMENT',
        type: 'SELL',
        price_min: 10000,
        price_max: 100000,
        region:
          '56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176, 56.992294 24.136619',
        comments: '',
      },
    );

    expect(Repository.createPinger).toHaveBeenCalledTimes(1);
  });

  test('successfully creates a pinger with defined `price_type` as `sqm`', async () => {
    await createPinger(
      {},
      {
        email: 'demo@email.com',
        category: 'APARTMENT',
        type: 'SELL',
        price_min: 10000,
        price_max: 100000,
        price_type: 'SQM',
        region:
          '56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176, 56.992294 24.136619',
      },
    );

    expect(Repository.createPinger).toHaveBeenCalledTimes(1);
  });

  test('successfully creates with category LAND and large max area', async () => {
    await createPinger(
      {},
      {
        email: 'demo@email.com',
        category: 'LAND',
        type: 'SELL',
        price_min: 10000,
        price_max: 100000,
        area_m2_max: 100000,
        region:
          '56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176, 56.992294 24.136619',
      },
    );
    expect(Repository.createPinger).toHaveBeenCalledTimes(1);
  });

  describe('fails creating when', () => {
    test('input validation fails', () => {
      expect(
        createPinger(
          {},
          {
            email: 'demo@email.com',
            category: 'APARTMENT',
            type: 'SELL',
            price_min: 10000,
            price_max: 100000,
            region: 'TEST',
            rooms_min: 10,
            rooms_max: 5,
          },
        ),
      ).rejects.toBeInstanceOf(UserInputError);
    });

    test('fails creating because area is too large', () => {
      expect(
        createPinger(
          {},
          {
            email: 'demo@email.com',
            category: 'APARTMENT',
            type: 'SELL',
            price_min: 10000,
            price_max: 100000,
            area_m2_max: 100000,
            region:
              '56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176, 56.992294 24.136619',
          },
        ),
      ).rejects.toBeInstanceOf(UserInputError);
    });

    test('region polygon validation fails', () => {
      expect(
        createPinger(
          {},
          {
            email: 'demo@email.com',
            category: 'APARTMENT',
            type: 'SELL',
            price_min: 10000,
            price_max: 100000,
            region:
              '56.96715 24.09457, 56.97923 24.14125, 56.9825 24.17984, 5695892 24.17559, 56.94571 24.14812, 56.93767 24.13181',
            rooms_min: 10,
            rooms_max: 5,
          },
        ),
      ).rejects.toBeInstanceOf(UserInputError);
    });

    test('5 pingers with the same email already exist', () => {
      Repository.getPingers.mockReturnValueOnce([
        { email: 'demo@email.com' },
        { email: 'demo@email.com' },
        { email: 'demo@email.com' },
        { email: 'demo@email.com' },
        { email: 'demo@email.com' },
      ]);

      expect(
        createPinger(
          {},
          {
            email: 'demo@email.com',
            category: 'APARTMENT',
            type: 'SELL',
            price_min: 10000,
            price_max: 100000,
            region:
              '56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176, 56.992294 24.136619',
          },
        ),
      ).rejects.toBeInstanceOf(UserInputError);
    });

    test('inserting in DB fails', () => {
      Repository.createPinger.mockImplementation(() => {
        throw new Error('Something bad happened');
      });

      expect(
        createPinger(
          {},
          {
            email: 'demo@email.com',
            category: 'APARTMENT',
            type: 'SELL',
            price_min: 10000,
            price_max: 100000,
            region: 'TEST',
          },
        ),
      ).rejects.toBeInstanceOf(Error);
    });
  });
});
