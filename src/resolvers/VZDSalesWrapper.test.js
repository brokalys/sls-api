import { UserInputError } from 'apollo-server-lambda';
import VZDApartmentSales from 'data-sources/vzd-apartment-sales';
import VZDHouseSales from 'data-sources/vzd-house-sales';
import resolvers from './VZDSalesWrapper';

jest.mock('data-sources/vzd-apartment-sales');
jest.mock('data-sources/vzd-house-sales');

const mockApartmentSales = [{ id: 1 }, { id: 2 }, { id: 3 }];
const mockHouseSales = [{ id: 1 }, { id: 2 }];

describe('VZDSalesWrapper', () => {
  let dataSources;
  let user;

  beforeEach(() => {
    dataSources = {
      vzdApartmentSales: VZDApartmentSales,
      vzdHouseSales: VZDHouseSales,
    };
    user = {
      hasRole: jest.fn().mockReturnValue(true),
    };

    VZDApartmentSales.loadByBuildingId.mockResolvedValueOnce(
      mockApartmentSales,
    );
    VZDHouseSales.loadByBuildingId.mockResolvedValueOnce(mockHouseSales);
    VZDHouseSales.get.mockResolvedValueOnce(mockHouseSales);
  });

  describe('apartments', () => {
    test('return the apartment data', async () => {
      const output = await resolvers.apartments(
        { id: 1 },
        { filter: { sale_date: { gte: '2020-01-01' } } },
        { dataSources, user },
        { fieldNodes: [] },
      );

      expect(output).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
      expect(VZDApartmentSales.loadByBuildingId).toBeCalledWith(
        expect.anything(),
        expect.objectContaining({
          object_type: { eq: 'Dz' },
        }),
      );
    });

    test('throws an error if trying to use invalid filters', async () => {
      expect(() =>
        resolvers.apartments(
          { id: 1 },
          { filter: { some_weird_filter: { eq: 'yep' } } },
          { dataSources, user },
          { fieldNodes: [] },
        ),
      ).toThrowError(UserInputError);
    });
  });

  describe('premises', () => {
    test('return the premise data', async () => {
      const output = await resolvers.premises(
        { id: 1 },
        { filter: { sale_date: { gte: '2020-01-01' } } },
        { dataSources, user },
        { fieldNodes: [] },
      );

      expect(output).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
      expect(VZDApartmentSales.loadByBuildingId).toBeCalledWith(
        expect.anything(),
        expect.objectContaining({
          object_type: { eq: 'T' },
        }),
      );
    });

    test('throws an error if trying to use invalid filters', async () => {
      expect(() =>
        resolvers.premises(
          { id: 1 },
          { filter: { some_weird_filter: { eq: 'yep' } } },
          { dataSources, user },
          { fieldNodes: [] },
        ),
      ).toThrowError(UserInputError);
    });
  });

  describe('houses', () => {
    test('return the house data', async () => {
      const output = await resolvers.houses(
        { id: 2 },
        { filter: { sale_date: { gte: '2020-01-01' } } },
        { dataSources, user },
        { fieldNodes: [] },
      );

      expect(output).toEqual(mockHouseSales);
    });

    test('return unlimited house data', async () => {
      const output = await resolvers.houses(
        {},
        { limit: null, filter: { sale_date: { gte: '2020-01-01' } } },
        { dataSources, user },
        { fieldNodes: [] },
      );

      expect(output).toEqual(mockHouseSales);
    });

    test('throws an error if trying to use invalid filters', async () => {
      expect(() =>
        resolvers.houses(
          { id: 2 },
          { filter: { some_weird_filter: { eq: 'yep' } } },
          { dataSources, user },
          { fieldNodes: [] },
        ),
      ).toThrowError(UserInputError);
    });
  });
});
