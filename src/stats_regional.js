const mysql = require('serverless-mysql')({
  config: {
    host     : process.env.DB_HOST,
    database : process.env.DB_DATABASE,
    user     : process.env.DB_USERNAME,
    password : process.env.DB_PASSWORD,
  },
});
const Joi = require('joi');
const moment = require('moment');
const numbers = require('numbers');
const inside = require('point-in-polygon');

const geojson = require('../data/riga-geojson.json');

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const schema = Joi.object().keys({
    category: Joi.string().valid('house', 'apartment', 'land').required(),
    type: Joi.string().valid('sell', 'rent').required(),
  });

  const { error, value } = Joi.validate(event.pathParameters, schema);

  if (error) {
    return {
      statusCode: 400,
      body: JSON.stringify(error),
    };
  }

  const { type, category } = value;
  const start = moment.utc().startOf('month').toISOString();
  const end = moment.utc().endOf('month').toISOString();

  const data = await getData(start, end, category, type);

  const lastYearData = await getData(
    moment.utc().subtract(1, 'year').startOf('month').toISOString(),
    moment.utc().subtract(1, 'year').endOf('month').toISOString(),
    category,
    type,
  );

  const mappedRegions = data.map((data) => {
    const lastYear = lastYearData.find(({ name }) => data.name === name);

    const buildObj = (a, b) => ({
      count: (a.count - b.count) / b.count,
      min: (a.min - b.min) / b.min,
      max: (a.max - b.max) / b.max,
      mean: (a.mean - b.mean) / b.mean,
      median: (a.median - b.median) / b.median,
      mode: (a.mode - b.mode) / b.mode,
      standardDev: (a.standardDev - b.standardDev) / b.standardDev,
    });

    return {
      ...data,
      change: {
        '1yr': buildObj(data, lastYear),
      },
    };
  });

  return {
    statusCode: 200,
    body: JSON.stringify(mappedRegions),
  };
}

async function getData(start, end, category, type) {
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

    values: [start, end, category, type],
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
