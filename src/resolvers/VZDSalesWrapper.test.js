import VZDApartmentSales from 'data-sources/vzd-apartment-sales';
import VZDHouseSales from 'data-sources/vzd-house-sales';
import resolvers from './VZDSalesWrapper';

jest.mock('data-sources/vzd-apartment-sales');
jest.mock('data-sources/vzd-house-sales');

const mockApartmentSales = [
  { id: 1, object_type: 'Dz' },
  { id: 2, object_type: 'Dz' },
  { id: 3, object_type: 'T' },
];
const mockHouseSales = [{ id: 1 }, { id: 2 }];

describe('VZDSalesWrapper', () => {
  let dataSources;

  beforeEach(() => {
    dataSources = {
      vzdApartmentSales: VZDApartmentSales,
      vzdHouseSales: VZDHouseSales,
    };

    VZDApartmentSales.loadByBuildingId.mockResolvedValueOnce(
      mockApartmentSales,
    );
    VZDHouseSales.loadByBuildingId.mockResolvedValueOnce(mockHouseSales);
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

  describe('houses', () => {
    test('return the house data', async () => {
      const output = await resolvers.houses(
        [1, 2],
        {},
        { dataSources },
        { fieldNodes: [] },
      );

      expect(output).toEqual(mockHouseSales);
    });
  });
});
