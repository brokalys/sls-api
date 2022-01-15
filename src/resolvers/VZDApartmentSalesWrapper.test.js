import VZDApartmentSales from 'data-sources/vzd-apartment-sales';
import resolvers from './VZDApartmentSalesWrapper';

jest.mock('data-sources/vzd-apartment-sales');

describe('VZDApartmentSalesWrapper', () => {
  let dataSources;

  beforeEach(() => {
    dataSources = {
      vzdApartmentSales: VZDApartmentSales,
    };
  });

  describe('results', () => {
    test('returns all the results', async () => {
      const apartmentSales = [
        { id: 1, price: 100 },
        { id: 2, price: 200 },
        { id: 3, price: 300 },
      ];
      VZDApartmentSales.loadMany.mockResolvedValueOnce(apartmentSales);

      const output = await resolvers.results(
        [1, 2, 3],
        {},
        { dataSources },
        { fieldNodes: [] },
      );

      expect(output).toEqual(apartmentSales);
    });
  });
});
