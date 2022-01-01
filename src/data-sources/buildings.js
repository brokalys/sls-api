import { distanceToPolygon } from 'distance-to-polygon';

import BaseDataSource from './base';

export default class Buildings extends BaseDataSource {
  getById(id) {
    return this.getDataLoader(
      this.knex('buildings').withSchema(process.env.DB_DATABASE),
    )
      .load(id)
      .then(([result]) => result);
  }

  getInBounds(bounds) {
    return this.knex('buildings')
      .withSchema(process.env.DB_DATABASE)
      .whereInBounds(bounds);
  }

  getInPoint(lat, lng) {
    return this.knex('buildings')
      .withSchema(process.env.DB_DATABASE)
      .whereInPoint(lat, lng);
  }

  async findBuildingIdByAddress({
    city,
    street,
    housenumber,
    lat,
    lng,
    foreign_id,
  }) {
    if (city && street && housenumber) {
      const buildings = await this.knex('buildings')
        .withSchema(process.env.DB_DATABASE)
        .where('city', city)
        .where('street', street)
        .where('housenumber', housenumber);

      if (buildings.length) {
        // Since there can be multiple matches.. calculate the distance
        // to each match and return the closest to the given lat, lng
        if (lat && lng) {
          const buildingsWithDistances = buildings
            .map((row) => {
              const bounds =
                this.config.client.driverName === 'sqlite3'
                  ? JSON.parse(row.bounds)
                  : row.bounds;
              const vertices = bounds[0].map(({ x, y }) => [x, y]);

              return {
                ...row,
                distance: distanceToPolygon([lat, lng], vertices),
              };
            })
            .sort((a, b) => a.distance - b.distance);

          return buildingsWithDistances[0].id;
        }

        // No lat,lng provided, so return the first result
        return buildings[0].id;
      }
    }

    if (lat && lng) {
      const buildingByLatLng = await this.getInPoint(lat, lng).first();

      if (buildingByLatLng) {
        return buildingByLatLng.id;
      }
    }

    // Last resort: check by foreign id
    if (foreign_id) {
      const property = await this.knex('properties')
        .withSchema(process.env.DB_DATABASE)
        .select('building_id')
        .where('foreign_id', foreign_id)
        .first();

      if (property) {
        return property.building_id;
      }
    }
  }
}
