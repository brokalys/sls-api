import getMapData from './get-map-data';

jest.mock('../get-regions', () => () => [
  {
    name: 'Āgenskalns',
    price_per_sqm: {
      median: 123,
      histogram: {
        values: [1, 2, 3, 4, 5],
        bins: 5,
        bin_width: 1,
        bin_limits: [1, 5],
      },
    },
  },
  { name: 'Mežaparks', price_per_sqm: { median: null, histogram: null } },
  { name: 'Imanta', price_per_sqm: { median: 100 } },
  { name: 'Jugla', price_per_sqm: { median: 100 } },
  { name: 'Torņakalns', price_per_sqm: { median: 40 } },
]);

describe('getMapData', () => {
  describe('response', () => {
    test('returns all regions with proper colors', async () => {
      const output = await getMapData(
        {},
        {
          category: 'APARTMENT',
          start_date: '2018-01-01',
          end_date: '2018-02-01',
        },
      );

      expect(output).toMatchSnapshot();
    });
  });
});
