import { UserInputError } from 'apollo-server-lambda';
import PropertiesDataSource from 'data-sources/properties';
import resolvers from './Land';

jest.mock('data-sources/properties');

const land = {
  id: 1,
  bounds: [
    [
      { x: 56.992294, y: 24.136619 },
      { x: 56.976394, y: 23.99579 },
      { x: 56.924904, y: 24.005336 },
      { x: 56.889288, y: 24.108467 },
      { x: 56.932211, y: 24.291935 },
      { x: 56.996502, y: 24.245176 },
      { x: 56.992294, y: 24.136619 },
    ],
  ],
};

describe('Land', () => {
  describe('id', () => {
    it('returns id value', () => {
      const output = resolvers.id(land);
      expect(output).toEqual(land.id);
    });
  });

  describe('bounds', () => {
    it('returns bounds value', () => {
      const output = resolvers.bounds(land);
      expect(output).toMatchSnapshot();
    });

    it('JSON decodes the value if it is a string', () => {
      const output = resolvers.bounds({
        ...land,
        bounds: JSON.stringify(land.bounds),
      });
      expect(output).toMatchSnapshot();
    });
  });

  describe('properties', () => {
    let dataSources;

    beforeEach(() => {
      dataSources = {
        properties: PropertiesDataSource,
      };
    });

    it('retrieves property ids for the given land', async () => {
      PropertiesDataSource.loadByLandId.mockResolvedValueOnce([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);

      const output = await resolvers.properties(land, {}, { dataSources });

      expect(output).toEqual([1, 2, 3]);
    });

    it('fails validating the provided filter', async () => {
      expect(() => {
        resolvers.properties(land, { filter: 'wrong' }, { dataSources });
      }).toThrowError(UserInputError);
    });
  });
});
