import { distanceToPolygon } from 'distance-to-polygon';

import BaseDataSource from './base';

const TABLE_NAME = 'vzd_land';

export default class Land extends BaseDataSource {
  getById(id) {
    return this.getDataLoader(
      this.knex(TABLE_NAME).withSchema(process.env.DB_DATABASE),
    )
      .load(id)
      .then(([result]) => result);
  }

  getInBounds(bounds) {
    const knex = this.knex;
    return this.knex(TABLE_NAME)
      .withSchema(process.env.DB_DATABASE)
      .whereInPolygon('bounds', bounds)
      .where(function () {
        this.whereIn(`${TABLE_NAME}.id`, function () {
          this.distinct('vzd_land_id')
            .from('property_land_links')
            .where('vzd_land_id', knex.ref(`${TABLE_NAME}.id`));
        }).orWhereIn(`${TABLE_NAME}.cadastral_designation`, function () {
          this.distinct('cadastral_designation')
            .from('vzd_land_links')
            .where(
              'cadastral_designation',
              knex.ref(`${TABLE_NAME}.cadastral_designation`),
            );
        });
      });
  }
}
