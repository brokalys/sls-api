import db from 'lib/db';
import getMedianPrice from './get-median-price';

jest.mock('lib/db');

db.query.mockImplementation(() => [{ price: 1 }, { price: 2 }, { price: 3 }]);

describe('getMedianPrice', () => {
  describe('response', () => {
    test('returns the count matched by criteria', async () => {
      const output = await getMedianPrice(
        {},
        {
          category: 'APARTMENT',
          type: 'SELL',
          start_date: '2018-01-01',
          region:
            '56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176, 56.992294 24.136619',
        },
      );

      expect(output).toEqual({ price: 2 });
    });
  });
});
