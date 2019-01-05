import getRegion from './get-region';

jest.mock('serverless-mysql');
jest.mock('../lib/cache');

describe('getRegion', () => {
  describe('response', () => {
    test('returns Āgenskalns region with statistical data', async () => {
      const output = await getRegion(
        {},
        {
          name: 'Āgenskalns',
          start_date: '2018-01-01',
          end_date: '2018-02-01',
        },
      );

      expect(output).toEqual({
        name: 'Āgenskalns',
        price: {
          count: 3,
          min: jasmine.any(Number),
          max: jasmine.any(Number),
          mean: jasmine.any(Number),
          median: jasmine.any(Number),
          mode: jasmine.any(Number),
          standardDev: jasmine.any(Number),
        },
        price_per_sqm: {
          count: 2,
          min: jasmine.any(Number),
          max: jasmine.any(Number),
          mean: jasmine.any(Number),
          median: jasmine.any(Number),
          mode: jasmine.any(Number),
          standardDev: jasmine.any(Number),
        },
      });
    });
  });
});
