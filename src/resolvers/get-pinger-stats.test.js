import db from '../lib/db';
import getPingerStats from './get-pinger-stats';

jest.mock('../lib/db');

db.query.mockImplementation(() => [
  {
    count: 1,
  },
]);

describe('getPingerStats', () => {
  describe('response', () => {
    test('returns the count matched by criteria', async () => {
      const output = await getPingerStats(
        {},
        {
          category: 'APARTMENT',
          type: 'SELL',
          price_min: 1,
          price_max: 2,
          region:
            '56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176',
        },
      );

      expect(output).toEqual({ pingers_last_month: 1 });
    });
  });
});
