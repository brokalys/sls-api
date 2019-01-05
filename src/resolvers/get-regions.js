import { UserInputError } from 'apollo-server-lambda';
import moment from 'moment';
import numbers from 'numbers';
import inside from 'point-in-polygon';

import cache from '../lib/cache';
import mysql from '../lib/db';
import geojson from '../../data/riga-geojson.json';

async function getRegions(parent, args) {
  const { category, type } = args;
  const start = moment.utc(args.start_date);
  const end = moment.utc(args.end_date);

  if (end.isBefore(start)) {
    throw new UserInputError('End date must come after start date');
  }

  if (end.isAfter(moment.utc())) {
    throw new UserInputError('End date must not be after today');
  }

  if (start.isBefore('2018-01-01')) {
    throw new UserInputError('Start date must be after `2018-01-01`');
  }

  if (end.diff(start, 'months', true) > 1) {
    throw new UserInputError(
      'Difference between start and end date must not be bigger than 1 month',
    );
  }

  const cached = await cache.get(args);

  if (cached) {
    return cached;
  }

  const data = await getRegionsData(parent, args);
  await cache.set(args, data);

  return data;
}

async function getRegionsData(parent, args) {
  const { category, type } = args;
  const start = moment.utc(args.start_date);
  const end = moment.utc(args.end_date);

  await mysql.connect();
  const connection = mysql.getClient();

  const data = (await mysql.query({
    sql: `
      SELECT price, lat, lng, area, area_measurement, price_per_sqm
      FROM properties
      WHERE published_at BETWEEN ? AND ?
      ${type ? `AND type = ${connection.escape(type.toLowerCase())}` : ''}
      ${
        category
          ? `AND category = ${connection.escape(category.toLowerCase())}`
          : ''
      }
      AND lat IS NOT NULL
      AND lng IS NOT NULL
      AND location_country = "Latvia"
      AND price > 1
    `,

    values: [start.toISOString(), end.endOf('day').toISOString()],
  })).map((row) => {
    if (!row.price_per_sqm && row.area_measurement === 'm2' && row.area) {
      row.price_per_sqm = row.price / row.area;
    }

    return row;
  });

  await mysql.end();

  return geojson.features
    .map((feature) => ({
      name: feature.properties.apkaime,
      polygons: feature.geometry.coordinates,
    }))
    .map((region) => {
      const filteredData = data.filter(({ lat, lng }) =>
        region.polygons.find((polygon) => inside([lng, lat], polygon)),
      );

      region.prices = filteredData.map(({ price }) => price);

      region.pricesPerSqm = filteredData
        .filter(({ price_per_sqm }) => !!price_per_sqm)
        .map(({ price_per_sqm }) => price_per_sqm);

      return region;
    })
    .map((region) => ({
      name: region.name,
      price: {
        count: region.prices.length,
        min: region.prices.length ? numbers.basic.min(region.prices) : null,
        max: region.prices.length ? numbers.basic.max(region.prices) : null,
        mean: numbers.statistic.mean(region.prices) || null,
        median: numbers.statistic.median(region.prices) || null,
        mode: numbers.statistic.mode(region.prices) || null,
        standardDev: numbers.statistic.standardDev(region.prices) || null,
      },
      price_per_sqm: {
        count: region.pricesPerSqm.length,
        min: region.pricesPerSqm.length
          ? numbers.basic.min(region.pricesPerSqm)
          : null,
        max: region.pricesPerSqm.length
          ? numbers.basic.max(region.pricesPerSqm)
          : null,
        mean: numbers.statistic.mean(region.pricesPerSqm) || null,
        median: numbers.statistic.median(region.pricesPerSqm) || null,
        mode: numbers.statistic.mode(region.pricesPerSqm) || null,
        standardDev: numbers.statistic.standardDev(region.pricesPerSqm) || null,
      },
    }));
}

export default getRegions;
