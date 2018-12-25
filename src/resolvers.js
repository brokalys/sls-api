const { GraphQLDate } = require('graphql-iso-date');
const { UserInputError } = require('apollo-server-lambda');

const mysql = require('serverless-mysql')({
  config: {
    host     : process.env.DB_HOST,
    database : process.env.DB_DATABASE,
    user     : process.env.DB_USERNAME,
    password : process.env.DB_PASSWORD,
  },
});
const moment = require('moment');
const numbers = require('numbers');
const inside = require('point-in-polygon');

const geojson = require('../data/riga-geojson.json');

async function getRegionalStats(root, args) {
  const category = args.category.toLowerCase();
  const type = args.type.toLowerCase();
  const start = moment.utc(args.start_date);
  const end = moment.utc(args.end_date);

  if (end.diff(start, 'months', true) > 1) {
    throw new UserInputError('Difference between start and end date must not be bigger than 1 month');
  }

  const regions = geojson.features.map((feature) => ({
    name: feature.properties.apkaime,
    polygons: feature.geometry.coordinates,
  }));

  const data = await mysql.query({
    sql: `
      SELECT price, lat, lng
      FROM properties
      WHERE published_at BETWEEN ? AND ?
      AND category = ?
      AND type = ?
      AND lat IS NOT NULL
      AND lng IS NOT NULL
      AND location_country = "Latvia"
      AND price > 1
    `,

    values: [start.toISOString(), end.endOf('day').toISOString(), category, type],
  });

  await mysql.end();

  return regions
    .map((region) => ({
      ...region,
      prices: data.filter(({ lat, lng }) =>
        region.polygons.find((polygon) => inside([lng, lat], polygon))
      ).map(({ price }) => price),
    }))
    .map((region) => ({
      name: region.name,
      count: region.prices.length,
      min: numbers.basic.min(region.prices),
      max: numbers.basic.max(region.prices),
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
