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
    return this.knex(TABLE_NAME)
      .withSchema(process.env.DB_DATABASE)
      .select(`${TABLE_NAME}.*`)
      .innerJoin(
        'property_land_links',
        `${TABLE_NAME}.id`,
        'property_land_links.vzd_land_id',
      )
      .groupBy(`${TABLE_NAME}.id`)
      .whereInPolygon('bounds', bounds);
  }
}
