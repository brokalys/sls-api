import { UserInputError } from 'apollo-server-lambda';

import db from 'lib/db';
import getPropertiesForPinger from './get-properties-for-pinger';

jest.mock('lib/db');

db.query.mockImplementation(() => [{ price: 1 }, { price: 2 }, { price: 3 }]);

describe('getPropertiesForPinger', () => {
  describe('response', () => {
    test('returns the properties matching criteria', async () => {
      const output = await getPropertiesForPinger(
        {},
        {
          category: 'APARTMENT',
          type: 'SELL',
          start_date: '2019-01-01 00:00:00',
          region:
            '56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176, 56.992294 24.136619',
        },
        {
          isAuthenticated: true,
        },
      );

      expect(output).toEqual([{ price: 1 }, { price: 2 }, { price: 3 }]);
    });

    test('with with all arguments present', async () => {
      const output = await getPropertiesForPinger(
        {},
        {
          category: 'APARTMENT',
          type: 'SELL',
          start_date: '2019-01-01 00:00:00',
          region:
            '56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176, 56.992294 24.136619',
          rooms: { min: 1, max: 10 },
          price: { min: 30000, max: 100000 },
          floor: { min: 2, max: 5 },
          area: { min: 60, max: 120 },
        },
        {
          isAuthenticated: true,
        },
      );

      expect(output).toEqual([{ price: 1 }, { price: 2 }, { price: 3 }]);
    });

    test('does not allow retrieving old data', () => {
      expect(() => {
        getPropertiesForPinger(
          {},
          {
            category: 'APARTMENT',
            type: 'SELL',
            start_date: '2018-12-30 00:00:00',
            region:
              '56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176, 56.992294 24.136619',
          },
          {
            isAuthenticated: true,
          },
        );
      }).toThrow(UserInputError);
    });

    test('does not work if start date is missing', () => {
      expect(() => {
        getPropertiesForPinger(
          {},
          {
            category: 'APARTMENT',
            type: 'SELL',
            region:
              '56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176, 56.992294 24.136619',
          },
          {
            isAuthenticated: true,
          },
        );
      }).toThrow(UserInputError);
    });

    test('returns nothing if not authenticated', () => {
      const output = getPropertiesForPinger(
        {},
        {
          category: 'APARTMENT',
          type: 'SELL',
          start_date: '2018-01-01 00:10:00',
          region:
            '56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176, 56.992294 24.136619',
        },
        {
          isAuthenticated: false,
        },
      );

      expect(output).toBeNull();
    });
  });
});
