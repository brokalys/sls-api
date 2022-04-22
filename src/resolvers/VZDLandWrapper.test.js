import { UserInputError } from 'apollo-server-lambda';
import VZDLandSales from 'data-sources/vzd-land-sales';
import resolvers from './VZDLandWrapper';

jest.mock('data-sources/vzd-land-sales');

const mockLandSales = [{ id: 1 }, { id: 2 }];

describe('VZDLandWrapper', () => {
  let dataSources;
  let user;

  beforeEach(() => {
    dataSources = {
      vzdLandSales: VZDLandSales,
    };
    user = {
      hasRole: jest.fn().mockReturnValue(true),
    };

    VZDLandSales.loadByLandCadastralDesignation.mockResolvedValueOnce(
      mockLandSales,
    );
    VZDLandSales.get.mockResolvedValueOnce(mockLandSales);
  });

  describe('land', () => {
    test('return the land data', async () => {
      const output = await resolvers.land(
        { id: 2 },
        { filter: { sale_date: { gte: '2020-01-01' } } },
        { dataSources, user },
        { fieldNodes: [] },
      );

      expect(output).toEqual(mockLandSales);
    });

    test('return unlimited land data', async () => {
      const output = await resolvers.land(
        {},
        { limit: null, filter: { sale_date: { gte: '2020-01-01' } } },
        { dataSources, user },
        { fieldNodes: [] },
      );

      expect(output).toEqual(mockLandSales);
    });

    test('throws an error if trying to use invalid filters', async () => {
      expect(() =>
        resolvers.land(
          { id: 2 },
          { filter: { some_weird_filter: { eq: 'yep' } } },
          { dataSources, user },
          { fieldNodes: [] },
        ),
      ).toThrowError(UserInputError);
    });
  });
});
