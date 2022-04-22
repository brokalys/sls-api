import BaseDataSource from './base';

const TABLE_NAME = 'vzd_land_sales';

class VZDLandSales extends BaseDataSource {
  get(filters, limit = undefined) {
    const query = this.knex(TABLE_NAME)
      .withSchema(process.env.DB_DATABASE)
      .leftJoin(
        'vzd_land',
        'vzd_land.cadastral_designation',
        `${TABLE_NAME}.land_cadastral_designation`,
      )
      .select(`${TABLE_NAME}.*`, 'vzd_land.id as land_id')
      .withFilters(filters)
      .timeout(5000);

    if (limit) {
      query.limit(limit);
    }

    return query;
  }

  loadByLandCadastralDesignation(cadastralDesignation, filters = {}) {
    const query = this.knex(TABLE_NAME)
      .withSchema(process.env.DB_DATABASE)
      .leftJoin(
        'vzd_land_links',
        `${TABLE_NAME}.id`,
        'vzd_land_links.vzd_land_sale_id',
      )
      .withFilters(filters)
      .select(`${TABLE_NAME}.*`, 'vzd_land_links.cadastral_designation');

    return this.getDataLoader(
      query,
      'vzd_land_links.cadastral_designation',
      'cadastral_designation',
    ).load(cadastralDesignation);
  }
}

export default VZDLandSales;
