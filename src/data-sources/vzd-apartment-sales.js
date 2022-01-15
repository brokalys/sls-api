import BaseDataSource from './base';

const TABLE_NAME = 'vzd_apartment_sales';

class VZDApartmentSales extends BaseDataSource {
  loadByBuildingId(id) {
    const query = this.knex(TABLE_NAME)
      .withSchema(process.env.DB_DATABASE)
      .leftJoin(
        'vzd_buildings',
        'vzd_buildings.cadastral_designation',
        `${TABLE_NAME}.building_cadastral_designation`,
      )
      .select(`${TABLE_NAME}.*`, 'vzd_buildings.id as building_id')
      .groupBy('sale_id');

    return this.getDataLoader(query, 'vzd_buildings.id', 'building_id').load(
      id,
    );
  }
}

export default VZDApartmentSales;
