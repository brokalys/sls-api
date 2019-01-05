import getMapData from './get-map-data';

jest.mock('./get-regions', () => () => [
  { name: 'Āgenskalns', price_per_sqm: { median: 123 } },
  { name: 'Mežaparks', price_per_sqm: { median: null } },
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
