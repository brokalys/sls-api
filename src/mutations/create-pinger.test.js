import { send } from 'mailgun-js';

import Repository from '../lib/repository';
import createPinger from './create-pinger';

jest.mock('../lib/repository', () => ({
  getPingers: jest.fn(() => []),
  createPinger: jest.fn(),
}));

describe('createPinger', () => {
  describe('when created successfully', () => {
    test('inserts a record in the DB', async () => {
      await createPinger(
        {},
        {
          email: 'demo@email.com',
          category: 'APARTMENT',
          type: 'SELL',
          price_min: 10000,
          price_max: 100000,
          region: 'TEST',
        },
      );

      expect(Repository.createPinger).toHaveBeenCalledTimes(1);
    });

    test('sends an email to admin', async () => {
      await createPinger(
        {},
        {
          email: 'demo@email.com',
          category: 'APARTMENT',
          type: 'SELL',
          price_min: 10000,
          price_max: 100000,
          region: 'TEST',
        },
      );

      expect(send).toHaveBeenCalledTimes(1);
    });

    test('successfully validates the region polygon', async () => {
      await createPinger(
        {},
        {
          email: 'demo@email.com',
          category: 'APARTMENT',
          type: 'SELL',
          price_min: 10000,
          price_max: 100000,
          region:
            '56.96715 24.09457, 56.97923 24.14125, 56.9825 24.17984, 56.95892 24.17559, 56.94571 24.14812, 56.93767 24.13181',
        },
      );

      expect(Repository.createPinger).toHaveBeenCalled();
    });
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
