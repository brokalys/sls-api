import { send } from 'mailgun-js';
import { UserInputError } from 'apollo-server-lambda';

import Repository from '../lib/repository';
import createPinger from './create-pinger';

jest.mock('../lib/repository', () => ({
  getPingers: jest.fn(() => []),
  getPinger: jest.fn(() => ({
    id: 1,
    unsubscribe_key: 'key',
  })),
  createPinger: jest.fn(() => 1),
  getPingerCount: jest.fn(() => 100),
}));

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
          '56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176',
      },
    );

    expect(Repository.createPinger).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(1);
  });

  describe('fails creating when', () => {
    test('input validation fails', async () => {
      expect.assertions(1);
      await expect(
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
      ).rejects.toBeInstanceOf(Error);
    });

    test('region polygon validation fails', async () => {
      expect.assertions(1);
      await expect(
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
      ).rejects.toBeInstanceOf(Error);
    });

    test('5 pingers with the same email already exist', async () => {
      Repository.getPingers.mockImplementation(() => [
        { email: 'demo@email.com' },
        { email: 'demo@email.com' },
        { email: 'demo@email.com' },
        { email: 'demo@email.com' },
        { email: 'demo@email.com' },
      ]);

      expect.assertions(1);
      await expect(
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

    test('inserting in DB fails', async () => {
      Repository.createPinger.mockImplementation(() => {
        throw new Error('Something bad happened');
      });

      expect.assertions(1);
      await expect(
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

    test('sending email fails', async () => {
      send.mockImplementation(() => {
        throw new Error('Something bad happened');
      });

      expect.assertions(1);
      await expect(
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
