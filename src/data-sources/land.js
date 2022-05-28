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

  async getInBounds(bounds) {
    const data = await this.knex(TABLE_NAME)
      .withSchema(process.env.DB_DATABASE)
      .whereInPolygon('bounds', bounds)
      .where('is_usable', true);

    const propertyLandLinks = (
      await this.knex('property_land_links')
        .distinct('vzd_land_id')
        .whereIn(
          'vzd_land_id',
          data.map((row) => row.id),
        )
    ).map((row) => row.vzd_land_id);

    const vzdLandLinks = (
      await this.knex('vzd_land_links')
        .distinct('cadastral_designation')
        .whereIn(
          'cadastral_designation',
          data.map((row) => row.cadastral_designation),
        )
    ).map((row) => row.cadastral_designation);

    // Filter rows that have either a `property` or `vzd` link
    return data.filter((row) => {
      return (
        propertyLandLinks.includes(row.id) ||
        vzdLandLinks.includes(row.cadastral_designation)
      );
    });
  }

  getInPoint(lat, lng) {
    return this.knex(TABLE_NAME)
      .withSchema(process.env.DB_DATABASE)
      .whereInPoint('bounds', lat, lng);
  }

  async findIdByAddress({ category, type, lat, lng }) {
    // Whitelist: only these options will have a "land"
    if (
      (!!category && !['land'].includes(category)) ||
      (!!type && !['sell', 'auction'].includes(type))
    ) {
      return;
    }

    if (lat && lng) {
      const plotInLatLng = await this.getInPoint(lat, lng).first();

      if (plotInLatLng) {
        return plotInLatLng.id;
      }
    }
  }
}
