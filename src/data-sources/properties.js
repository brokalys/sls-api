import BaseDataSource from './base';

class Properties extends BaseDataSource {
  get(filters, limit = undefined, fields = undefined) {
    const query = this.knex('properties')
      .withSchema(process.env.DB_DATABASE)
      .withFilters(filters)
      .timeout(5000);

    if (fields) {
      query.select(fields);
    }

    if (limit) {
      query.limit(limit);
    }

    return query;
  }

  load(id, fields) {
    return this.getDataLoader(
      this.knex('properties')
        .withSchema(process.env.DB_DATABASE)
        .select(fields),
    ).load(id);
  }

  loadMany(ids, fields) {
    return this.getDataLoader(
      this.knex('properties').withSchema(process.env.DB_DATABASE),
    )
      .loadMany(ids)
      .then((results) => results.map(([data]) => data));
  }

  loadByBuildingId(id, filters) {
    const query = this.knex('properties')
      .withSchema(process.env.DB_DATABASE)
      .leftJoin(
        'property_building_links',
        'properties.id',
        'property_building_links.property_id',
      )
      .withFilters(filters)
      .select('properties.id', 'property_building_links.vzd_building_id');

    return this.getDataLoader(
      query,
      'property_building_links.vzd_building_id',
      'vzd_building_id',
    ).load(id);
  }

  create(values) {
    const lat_lng_point = this.knex.raw(
      `point(${[values.lat || 0, values.lng || 0].join(', ')})`,
    );

    return this.knex('properties')
      .withSchema(process.env.DB_DATABASE)
      .insert(
        this.knex.client.driverName === 'sqlite3'
          ? values
          : {
              ...values,
              lat_lng_point,
            },
      )
      .timeout(1000);
  }
}

export default Properties;
