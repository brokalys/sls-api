import { distanceToPolygon } from 'distance-to-polygon';

import BaseDataSource from './base';

const TABLE_NAME = 'vzd_buildings';

export default class Buildings extends BaseDataSource {
  get(filters, limit = undefined) {
    const query = this.knex(TABLE_NAME)
      .withSchema(process.env.DB_DATABASE)
      .withFilters(filters)
      .timeout(5000);

    if (limit) {
      query.limit(limit);
    }

    return query;
  }

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
          this.distinct('vzd_building_id')
            .from('property_building_links')
            .where('vzd_building_id', knex.ref(`${TABLE_NAME}.id`));
        })
          .orWhereIn(`${TABLE_NAME}.cadastral_designation`, function () {
            this.distinct('building_cadastral_designation')
              .from('vzd_apartment_sales')
              .where(
                'building_cadastral_designation',
                knex.ref(`${TABLE_NAME}.cadastral_designation`),
              );
          })
          .orWhereIn(`${TABLE_NAME}.cadastral_designation`, function () {
            this.distinct('building_cadastral_designation')
              .from('vzd_house_sales')
              .where(
                'building_cadastral_designation',
                knex.ref(`${TABLE_NAME}.cadastral_designation`),
              );
          });
      });
  }

  getInPoint(lat, lng) {
    return this.knex(TABLE_NAME)
      .withSchema(process.env.DB_DATABASE)
      .whereInPoint('bounds', lat, lng);
  }

  async findBuildingIdByAddress({
    category,
    type,
    city,
    street,
    housenumber,
    lat,
    lng,
    foreign_id,
  }) {
    // Whitelist: only these options will have a "building"
    if (
      (!!category && !['apartment', 'house', 'office'].includes(category)) ||
      (!!type && !['sell', 'auction', 'rent'].includes(type))
    ) {
      return;
    }

    if (city && street && housenumber) {
      const buildings = await this.knex(TABLE_NAME)
        .withSchema(process.env.DB_DATABASE)
        .where('city', city)
        .where('street', street)
        .where('house_number', housenumber);

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
      const buildingByLatLng = await this.knex(TABLE_NAME)
        .whereNearestToPoint('bounds', lat, lng)
        .first();

      if (buildingByLatLng) {
        return buildingByLatLng.id;
      }
    }

    // Last resort: check by foreign id
    if (foreign_id) {
      const property = await this.knex('properties')
        .withSchema(process.env.DB_DATABASE)
        .select('property_building_links.vzd_building_id as building_id')
        .leftJoin(
          'property_building_links',
          'properties.id',
          'property_building_links.property_id',
        )
        .where('foreign_id', foreign_id)
        .first();

      if (property) {
        return property.building_id;
      }
    }
  }
}
