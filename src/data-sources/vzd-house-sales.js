import BaseDataSource from './base';

const TABLE_NAME = 'vzd_house_sales';

class VZDHouseSales extends BaseDataSource {
  get(filters, limit = undefined) {
    const query = this.knex(TABLE_NAME)
      .withSchema(process.env.DB_DATABASE)
      .leftJoin(
        'vzd_buildings',
        'vzd_buildings.cadastral_designation',
        `${TABLE_NAME}.building_cadastral_designation`,
      )
      .select(`${TABLE_NAME}.*`, 'vzd_buildings.id as building_id')
      .withFilters(filters)
      .timeout(5000);

    if (limit) {
      query.limit(limit);
    }

    return query;
  }

  loadByBuildingId(id, filters = {}) {
    const query = this.knex(TABLE_NAME)
      .withSchema(process.env.DB_DATABASE)
      .leftJoin(
        'vzd_buildings',
        'vzd_buildings.cadastral_designation',
        `${TABLE_NAME}.building_cadastral_designation`,
      )
      .select(`${TABLE_NAME}.*`, 'vzd_buildings.id as building_id')
      .withFilters(filters)
      .groupBy('sale_id');

    return this.getDataLoader(query, 'vzd_buildings.id', 'building_id').load(
      id,
    );
  }
}

export default VZDHouseSales;
