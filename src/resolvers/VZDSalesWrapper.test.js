import VZDApartmentSales from 'data-sources/vzd-apartment-sales';
import resolvers from './VZDSalesWrapper';

jest.mock('data-sources/vzd-apartment-sales');

const mockSales = [
  { id: 1, object_type: 'Dz' },
  { id: 2, object_type: 'Dz' },
  { id: 3, object_type: 'T' },
];

describe('VZDSalesWrapper', () => {
  let dataSources;

  beforeEach(() => {
    dataSources = {
      vzdApartmentSales: VZDApartmentSales,
    };

    VZDApartmentSales.loadByBuildingId.mockResolvedValueOnce(mockSales);
  });

  describe('apartments', () => {
    test('return the apartment data', async () => {
      const output = await resolvers.apartments(
        [1, 2, 3],
        {},
        { dataSources },
        { fieldNodes: [] },
      );

      expect(output).toEqual([
        { id: 1, object_type: 'Dz' },
        { id: 2, object_type: 'Dz' },
      ]);
    });
  });

  describe('premises', () => {
    test('return the premise data', async () => {
      const output = await resolvers.premises(
        [1, 2, 3],
        {},
        { dataSources },
        { fieldNodes: [] },
      );

      expect(output).toEqual([{ id: 3, object_type: 'T' }]);
    });
  });
});
