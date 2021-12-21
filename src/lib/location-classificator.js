import { riga, latvia } from '@brokalys/location-json-schemas';
import area from 'area-polygon';
import inside from 'point-in-polygon';

const latviaFeatures = latvia.features;

/**
 * Classify locations for faster regional lookups.
 */
export default function getLocationClassificator(lat, lng) {
  if (!lat || !lng) {
    return;
  }

  const location = riga.features.find(({ geometry }) =>
    inside([lng, lat], geometry.coordinates[0]),
  );

  if (location) {
    return location.properties.id;
  }

  const allLatviaLocations = latviaFeatures
    .filter(
      ({ geometry }) =>
        !!geometry.coordinates[0].find((coord) => inside([lng, lat], coord)),
    )
    .map((row) => ({
      id: row.properties.id,
      area: row.geometry.coordinates[0].reduce(
        (carry, item) => carry + area(item),
        0,
      ),
    }))
    .sort((a, b) => a.area - b.area);

  if (allLatviaLocations.length) {
    return allLatviaLocations[0].id;
  }
}
