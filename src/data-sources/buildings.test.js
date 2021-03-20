import Buildings from './buildings';
import mysql from 'lib/db';

jest.mock('lib/db');

describe('Buildings', () => {
  let buildings;

  beforeEach(() => {
    buildings = new Buildings({ client: 'mysql' });
  });

  describe('getInBounds', () => {
    it('returns the values', async () => {
      const results = [{ id: 1 }, { id: 2 }];
      mysql.query.mockResolvedValue(results);

      const output = await buildings.getInBounds(
        '56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176, 56.992294 24.136619',
      );

      expect(output).toEqual(results);
    });
  });
});
