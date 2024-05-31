import PingerDataSource from 'data-sources/pingers';
import resolvers from './PingerWrapper';

jest.mock('data-sources/pingers');

describe('PingerWrapper', () => {
  let dataSources;

  beforeEach(() => {
    dataSources = {
      pingers: PingerDataSource,
    };
  });

  describe('results', () => {
    test('returns all the results', async () => {
      const pingers = [
        { id_hash: '1', email: 'demo+1@test.com' },
        { id_hash: '2', email: 'demo+2@test.com' },
        { id_hash: '3', email: 'demo+3@test.com' },
      ];
      PingerDataSource.loadMany.mockResolvedValueOnce(pingers);

      const output = await resolvers.results(
        ['1', '2', '3'],
        {},
        { dataSources },
        { fieldNodes: [] },
      );

      expect(output).toEqual(pingers);
    });
  });
});
