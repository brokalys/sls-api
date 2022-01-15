import VZDApartmentSales from 'data-sources/vzd-apartment-sales';
import resolvers from './VZDSalesWrapper';

jest.mock('data-sources/vzd-apartment-sales');

describe('VZDSalesWrapper', () => {
  let dataSources;

  beforeEach(() => {
    dataSources = {
      vzdApartmentSales: VZDApartmentSales,
    };
  });

  describe('apartments', () => {
    test('return the apartment IDs', async () => {
      const apartmentSales = [{ id: 1 }, { id: 2 }, { id: 3 }];
      VZDApartmentSales.loadByBuildingId.mockResolvedValueOnce(apartmentSales);

      const output = await resolvers.apartments(
        [1, 2, 3],
        {},
        { dataSources },
        { fieldNodes: [] },
      );

      expect(output).toEqual(apartmentSales);
    });
  });
});
