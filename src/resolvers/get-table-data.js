import moment from 'moment';
import numbers from 'numbers';
import inside from 'point-in-polygon';

import geojson from '../../data/riga-geojson.json';
import cache from '../lib/cache';
import mysql from '../lib/db';

function calculatePercentageDifference(a, b) {
  if (!a || !b) {
    return null;
  }

  return a / b - 1;
}

async function getTableData(parent, { category }) {
  const start = moment()
    .subtract(1, 'month')
    .utc()
    .startOf('month');
  const end = start.clone().endOf('month');

  return await cache.run(
    'getTableData',
    {
      category: category.toLowerCase(),
      start: start.format('DD-MM-YYYY'),
      end: end.format('DD-MM-YYYY'),
    },
    getTableDataNow,
  );
}

async function getTableDataNow({ category, start, end }) {
  start = moment(start, 'DD-MM-YYYY');
  end = moment(end, 'DD-MM-YYYY');

  const lastMonth = await cache.run(
    'getTableDataQuery',
    {
      category,
      start: start.toISOString(),
      end: end.toISOString(),
    },
    getData,
  );
  const lastYear = await cache.run(
    'getTableDataQuery',
    {
      category,
      start: start
        .clone()
        .subtract(1, 'year')
        .toISOString(),
      end: end
        .clone()
        .subtract(1, 'year')
        .toISOString(),
    },
    getData,
  );

  return lastMonth.map((row, index) => {
    const lastYearRow = lastYear[index];

    return {
      ...row,
      price_per_sqm_change: {
        sell: calculatePercentageDifference(
          row.price_per_sqm.sell,
          lastYearRow.price_per_sqm.sell,
        ),
        rent: calculatePercentageDifference(
          row.price_per_sqm.rent,
          lastYearRow.price_per_sqm.rent,
        ),
      },
      btl_ratio_change: calculatePercentageDifference(
        row.btl_ratio,
        lastYearRow.btl_ratio,
      ),
    };
  });
}

async function getData({ category, start, end }) {
  const data = (await mysql.query({
    sql: `
      SELECT type, price, lat, lng, area, area_measurement, price_per_sqm
      FROM properties
      WHERE published_at BETWEEN ? AND ?
      AND (type = "rent" AND rent_type = "monthly" OR type = "sell")
      AND category = ?
      AND lat IS NOT NULL
      AND lng IS NOT NULL
      AND location_country = "Latvia"
      AND price > 1
    `,

    values: [start, end, category],
  })).map((row) => {
    if (!row.price_per_sqm && row.area_measurement === 'm2' && row.area) {
      row.price_per_sqm = row.price / row.area;
    }

    return row;
  });
  await mysql.end();

  return geojson.features.map(({ properties, geometry: { coordinates } }) => {
    const filteredData = data.filter(({ lat, lng }) =>
      coordinates.find((polygon) => inside([lng, lat], polygon)),
    );

    const prices = filteredData
      .map(({ price_per_sqm }) => price_per_sqm)
      .filter((price) => !!price);

    const sellPrices = filteredData
      .filter(({ type }) => type === 'sell')
      .map(({ price_per_sqm }) => price_per_sqm)
      .filter((price) => !!price);

    const rentPrices = filteredData
      .filter(({ type }) => type === 'rent')
      .map(({ price_per_sqm }) => price_per_sqm)
      .filter((price) => !!price);

    return {
      name: properties.name,
      price_per_sqm: {
        sell: numbers.statistic.median(sellPrices) || null,
        rent: numbers.statistic.median(rentPrices) || null,
      },
      btl_ratio:
        (numbers.statistic.median(rentPrices) * 12) /
        numbers.statistic.median(sellPrices),
    };
  });
}

export default getTableData;
