import { UserInputError } from 'apollo-server-lambda';
import PropertiesDataSource from 'data-sources/properties';
import resolvers from './Building';

jest.mock('data-sources/properties');

const building = {
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

describe('Building', () => {
  describe('id', () => {
    it('returns id value', () => {
      const output = resolvers.id(building);
      expect(output).toEqual(building.id);
    });
  });

  describe('bounds', () => {
    it('returns bounds value', () => {
      const output = resolvers.bounds(building);
      expect(output).toMatchSnapshot();
    });

    it('JSON decodes the value if it is a string', () => {
      const output = resolvers.bounds({
        ...building,
        bounds: JSON.stringify(building.bounds),
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

    it('retrieves property ids for the given building', async () => {
      PropertiesDataSource.loadByBuildingId.mockResolvedValueOnce([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);

      const output = await resolvers.properties(building, {}, { dataSources });

      expect(output).toEqual([1, 2, 3]);
    });

    it('fails validating the provided filter', async () => {
      expect(() => {
        resolvers.properties(building, { filter: 'wrong' }, { dataSources });
      }).toThrowError(UserInputError);
    });
  });
});
