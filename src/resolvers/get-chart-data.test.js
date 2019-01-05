import getChartData from './get-chart-data';

jest.mock('./get-regions', () => () => [
  { name: 'Āgenskalns', price_per_sqm: { median: 123, count: 12 } },
  { name: 'Mežaparks', price_per_sqm: { median: null, count: null } },
  { name: 'Imanta', price_per_sqm: { median: 100, count: 2 } },
  { name: 'Jugla', price_per_sqm: { median: 100, count: 10 } },
  { name: 'Torņakalns', price_per_sqm: { median: 40, count: 5 } },
]);

describe('getChartData', () => {
  describe('response', () => {
    test('returns all chart data', async () => {
      const output = await getChartData({}, { category: 'APARTMENT' });

      expect(output).toMatchSnapshot();
    });
  });
});
