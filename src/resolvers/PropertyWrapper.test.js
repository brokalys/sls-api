import { UserInputError } from 'apollo-server-lambda';
import PropertiesDataSource from 'data-sources/properties';
import resolvers from './PropertyWrapper';

jest.mock('data-sources/properties');

describe('PropertyWrapper', () => {
  let dataSources;

  beforeEach(() => {
    dataSources = {
      properties: PropertiesDataSource,
    };
  });

  describe('results', () => {
    test('returns all the results', async () => {
      const properties = [
        { id: 1, price: 100 },
        { id: 2, price: 200 },
        { id: 3, price: 300 },
      ];
      PropertiesDataSource.loadMany.mockResolvedValueOnce(properties);

      const output = await resolvers.results(
        [1, 2, 3],
        {},
        { dataSources },
        { fieldNodes: [] },
      );

      expect(output).toEqual(properties);
    });
  });

  describe('summary', () => {
    describe('count', () => {
      test('returns the length of the retrieved properties', () => {
        const output = resolvers.summary([1, 2, 3], {}, { dataSources }).count;

        expect(output).toEqual(3);
      });
    });

    describe('price', () => {
      test('retrieves all the prices', async () => {
        PropertiesDataSource.loadMany.mockResolvedValueOnce([
          { id: 1, price: 100 },
          { id: 2, price: 200 },
          { id: 3, price: 300 },
        ]);

        const output = await resolvers
          .summary([1, 2, 3], {}, { dataSources })
          .price();

        expect(output).toEqual([100, 200, 300]);
      });

      test('discards 50% of the results', async () => {
        PropertiesDataSource.loadMany.mockResolvedValueOnce([
          { id: 1, price: 100 },
          { id: 2, price: 200 },
          { id: 3, price: 300 },
          { id: 4, price: 400 },
        ]);

        const output = await resolvers
          .summary([1, 2, 3, 4], {}, { dataSources })
          .price({ discard: 0.5 });

        expect(output).toEqual([200, 300]);
      });

      test('fails validating the provided discard parameter', async () => {
        expect(
          resolvers
            .summary([1, 2], {}, { dataSources })
            .price({ discard: 'wrong' }),
        ).rejects.toBeInstanceOf(UserInputError);
      });
    });
  });
});
