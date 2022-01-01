import BuildingsDataSource from './buildings';
import db from 'db-config';

describe('BuildingsDataSource', () => {
  let dataSource;

  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterAll(async () => {
    await db.destroy();
  });

  beforeEach(() => {
    dataSource = new BuildingsDataSource(db);
  });

  describe('findBuildingIdByAddress', () => {
    it('uses the city/address/housenumber data to get the building_id (single match)', async () => {
      const output = await dataSource.findBuildingIdByAddress({
        lat: 56,
        lng: 24,
        city: 'riga',
        street: 'brivibas',
        housenumber: '12',
      });

      expect(output).toEqual(1);
    });

    it('uses the city/address/housenumber data to get the building_id (multi-match)', async () => {
      const output = await dataSource.findBuildingIdByAddress({
        lat: 56,
        lng: 24,
        city: 'riga',
        street: 'brivibas',
        housenumber: '13',
      });

      expect(output).toEqual(4);
    });

    it('uses lat/lng to get the building_id', async () => {
      const output = await dataSource.findBuildingIdByAddress({
        lat: 1,
        lng: 3,
        city: 'riga',
        street: 'brivibas',
        housenumber: '14',
      });

      expect(output).toEqual(4); // 1+3
    });

    it('uses foreign_id to get the building_id', async () => {
      const output = await dataSource.findBuildingIdByAddress({
        foreign_id: 'id999',
      });

      expect(output).toEqual(4);
    });

    it('if not enough data - returns nothing', async () => {
      jest.spyOn(dataSource, 'knex');

      const output = await dataSource.findBuildingIdByAddress({});

      expect(dataSource.knex).not.toBeCalled();
      expect(output).toEqual(undefined);
    });
  });
});
