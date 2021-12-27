import Knex from 'knex';

Knex.QueryBuilder.extend('whereInBounds', function (bounds) {
  return this.where(function () {
    // SQLite does not support spatial lookup
    // some ugly hacking to make integration tests work nicely
    if (this.client.driverName === 'sqlite3') {
      const parts = bounds.split(', ');
      if (parts[0] === parts[parts.length - 1]) parts.pop();

      return this.where(
        'bounds',
        JSON.stringify([
          parts.map((row) => {
            const [x, y] = row.split(' ');
            return { x: parseFloat(x), y: parseFloat(y) };
          }),
        ]),
      );
    }

    return this.whereRaw('ST_Contains(ST_GeomFromText(?), bounds)', [
      `POLYGON((${bounds}))`,
    ]);
  });
});

Knex.QueryBuilder.extend('whereInPoint', function (lat, lng) {
  return this.where(function () {
    // SQLite does not support spatial lookup
    // some ugly hacking to make integration tests work nicely
    if (this.client.driverName === 'sqlite3') {
      return this.where('id', parseInt(lat + lng));
    }

    return this.whereRaw('ST_Contains(bounds, ST_GeomFromText(?))', [
      `POINT(${lat} ${lng})`,
    ]);
  });
});

Knex.QueryBuilder.extend('withFilters', function (filters) {
  const query = this;

  function buildQueryPart(field, filter = {}) {
    if (typeof filter !== 'object') {
      return query.where(field, filter);
    }

    if (filter.in !== undefined) {
      // Reserved keyword
      if (field === 'region') {
        query.whereRaw('ST_Contains(ST_GeomFromText(?), lat_lng_point)', [
          `POLYGON((${filter.in[0]}))`,
        ]);
      } else {
        query.whereIn(field, filter.in);
      }
    }

    if (filter.nin !== undefined) {
      query.whereNotIn(field, filter.nin);
    }

    if (filter.eq !== undefined) {
      query.where(field, filter.eq);
    }

    if (filter.neq !== undefined) {
      query.where(field, '!=', filter.neq);
    }

    if (filter.gt !== undefined) {
      query.where(
        field,
        '>',
        filter.gt instanceof Date ? filter.gt.toISOString() : filter.gt,
      );
    }

    if (filter.gte !== undefined) {
      query.where(
        field,
        '>=',
        filter.gte instanceof Date ? filter.gte.toISOString() : filter.gte,
      );
    }

    if (filter.lt !== undefined) {
      query.where(
        field,
        '<',
        filter.lt instanceof Date ? filter.lt.toISOString() : filter.lt,
      );
    }

    if (filter.lte !== undefined) {
      query.where(
        field,
        '<=',
        filter.lte instanceof Date ? filter.lte.toISOString() : filter.lte,
      );
    }
  }

  Object.entries(filters).forEach(([key, value]) => buildQueryPart(key, value));
  return query;
});
