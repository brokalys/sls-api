import db from '../lib/db';
import getRegion from './get-region';

jest.mock('../lib/cache');
jest.mock('../lib/db');

db.query.mockImplementation(() => [
  {
    price: 110000.0,
    lat: 56.9366684,
    lng: 24.0794235,
    price_per_sqm: 100,
    area: 120,
    area_measurement: 'm2',
  },
  {
    price: 170000.0,
    lat: 56.9366684,
    lng: 24.0794235,
    price_per_sqm: 0,
    area: 1,
    area_measurement: 'ha',
  },
  {
    price: 70000.0,
    lat: 56.9366684,
    lng: 24.0794235,
    price_per_sqm: 0,
    area: 120,
    area_measurement: 'm2',
  },
]);

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
