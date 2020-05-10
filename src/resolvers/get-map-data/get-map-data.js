import colormap from 'colormap';

import geojson from 'riga-geojson.json';
import getRegions from '../get-regions';

async function getMapData(parent, args) {
  const data = await getRegions(parent, args);

  const getPrice = (region) => parseInt(region.price_per_sqm.median, 10);

  const uniquePrices = [
    ...new Set(
      data
        .map(getPrice)
        .filter((a) => !isNaN(a))
        .sort((a, b) => a - b),
    ),
  ];

  const colors =
    uniquePrices.length >= 3
      ? colormap({
          colormap: 'autumn',
          nshades: uniquePrices.length,
          format: 'hex',
        }).reverse()
      : [null, null];

  const priceColorMap = uniquePrices.reduce(
    (full, price, index) => ({
      ...full,
      [price]: colors[index],
    }),
    {},
  );

  return {
    type: 'FeatureCollection',
    features: data.map((region) => ({
      type: 'Feature',
      properties: {
        name: region.name,
        color: priceColorMap[getPrice(region)],
        histogram: region.price_per_sqm.histogram,
      },
      geometry: geojson.features.find(
        ({ properties: { name } }) => name === region.name,
      ).geometry,
    })),
  };
}

export default getMapData;
