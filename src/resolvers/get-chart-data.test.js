import db from '../lib/db';
import getChartData from './get-chart-data';

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
    published_at: '2018-12-01',
  },
  {
    price: 170000.0,
    lat: 56.9366684,
    lng: 24.0794235,
    price_per_sqm: 0,
    area: 1,
    area_measurement: 'ha',
    published_at: '2018-12-01',
  },
  {
    price: 70000.0,
    lat: 56.9366684,
    lng: 24.0794235,
    price_per_sqm: 0,
    area: 120,
    area_measurement: 'm2',
    published_at: '2018-11-01',
  },
]);

describe('getChartData', () => {
  describe('response', () => {
    test('returns all chart data with only category', async () => {
      const output = await getChartData(
        {},
        { category: 'APARTMENT', date: '2018-01-01' },
      );

      expect(output).toMatchSnapshot();
    });

    test('returns all chart data with category + type', async () => {
      const output = await getChartData(
        {},
        {
          category: 'APARTMENT',
          type: 'SELL',
          date: '2018-01-01',
        },
      );

      expect(output).toMatchSnapshot();
    });
  });
});
