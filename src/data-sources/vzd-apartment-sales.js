import BaseDataSource from './base';

const TABLE_NAME = 'vzd_apartment_sales';

class VZDApartmentSales extends BaseDataSource {
  loadMany(ids) {
    return this.getDataLoader(
      this.knex(TABLE_NAME).withSchema(process.env.DB_DATABASE),
    )
      .loadMany(ids)
      .then((results) => results.map(([data]) => data));
  }

  async loadByBuildingId(id) {
    const query = this.knex(TABLE_NAME)
      .withSchema(process.env.DB_DATABASE)
      .leftJoin(
        'vzd_buildings',
        'vzd_buildings.cadastral_designation',
        `${TABLE_NAME}.building_cadastral_designation`,
      )
      .where(`${TABLE_NAME}.object_type`, 'Dz')
      .select(`${TABLE_NAME}.id`, 'vzd_buildings.id as building_id')
      .groupBy('sale_id');

    const ids = await this.getDataLoader(
      query,
      'vzd_buildings.id',
      'building_id',
    )
      .load(id)
      .then((results) => results.map(({ id }) => id));

    return this.loadMany(ids);
  }
}

export default VZDApartmentSales;
