import { send } from 'mailgun-js';

import Repository from '../lib/repository';
import createPinger from './create-pinger';

jest.mock('../lib/repository', () => ({
  getPingers: jest.fn(() => []),
  createPinger: jest.fn(),
}));

describe('createPinger', () => {
  describe('when created successfully', () => {
    it('inserts a record in the DB', async () => {
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

    it('sends an email to admin', async () => {
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
  });

  describe('fails creating when', () => {
    it('input validation fails', async () => {
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

    it('5 pingers with the same email already exist', async () => {
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

    it('inserting in DB fails', async () => {
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

    it('sending email fails', async () => {
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
