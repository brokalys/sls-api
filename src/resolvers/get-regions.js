import { UserInputError } from 'apollo-server-lambda';
import moment from 'moment';
import numbers from 'numbers';
import inside from 'point-in-polygon';
import stats from 'stats-lite';

import cache from '../lib/cache';
import Repository from '../lib/repository';
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

  const cached = await cache.get('getRegions', args);

  if (cached) {
    return cached;
  }

  const data = await getRegionsData(args);
  await cache.set('getRegions', args, data);

  return data;
}

export async function getRegionsData(args) {
  const { category, type } = args;
  const start = moment.utc(args.start_date);
  const end = moment.utc(args.end_date);

  const data = await Repository.getRegionData({ category, type, start, end });

  return geojson.features
    .map((feature) => ({
      name: feature.properties.name,
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

      region.histogram = {
        prices: stats.histogram(region.prices, 10),
        pricesPerSqm: stats.histogram(region.pricesPerSqm, 10),
      };

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
        histogram: region.histogram.prices
          ? {
              values: region.histogram.prices.values,
              bins: region.histogram.prices.bins,
              bin_width: region.histogram.prices.binWidth,
              bin_limits: region.histogram.prices.binLimits,
            }
          : null,
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
        histogram: region.histogram.pricesPerSqm
          ? {
              values: region.histogram.pricesPerSqm.values,
              bins: region.histogram.pricesPerSqm.bins,
              bin_width: region.histogram.pricesPerSqm.binWidth,
              bin_limits: region.histogram.pricesPerSqm.binLimits,
            }
          : null,
      },
    }));
}

export default getRegions;
