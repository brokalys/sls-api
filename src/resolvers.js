import { GraphQLDate } from 'graphql-iso-date';
import { UserInputError } from 'apollo-server-lambda';
import serverlessMysql from 'serverless-mysql';
import moment from 'moment';
import numbers from 'numbers';
import inside from 'point-in-polygon';

import geojson from '../data/riga-geojson.json';

const mysql = serverlessMysql({
  config: {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
});

async function getRegionalStats(root, args) {
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

  const regions = geojson.features.map((feature) => ({
    name: feature.properties.apkaime,
    polygons: feature.geometry.coordinates,
  }));

  await mysql.connect();

  const connection = mysql.getClient();

  const data = await mysql.query({
    sql: `
      SELECT price, lat, lng
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
  });

  await mysql.end();

  return regions
    .map((region) => ({
      ...region,
      prices: data
        .filter(({ lat, lng }) =>
          region.polygons.find((polygon) => inside([lng, lat], polygon)),
        )
        .map(({ price }) => price),
    }))
    .map((region) => ({
      name: region.name,
      count: region.prices.length,
      min: region.prices.length ? numbers.basic.min(region.prices) : null,
      max: region.prices.length ? numbers.basic.max(region.prices) : null,
      mean: numbers.statistic.mean(region.prices),
      median: numbers.statistic.median(region.prices),
      mode: numbers.statistic.mode(region.prices),
      standardDev: numbers.statistic.standardDev(region.prices),
    }));
}

exports.resolvers = {
  Date: GraphQLDate,
  Query: {
    getRegionalStats,
  },
};
