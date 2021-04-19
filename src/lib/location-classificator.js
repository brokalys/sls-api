import { riga, latvia } from '@brokalys/location-json-schemas';
import inside from 'point-in-polygon';

const latviaFeatures = latvia.features.reverse();

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

  const allLatviaLocation = latviaFeatures.find(
    ({ geometry }) =>
      !!geometry.coordinates[0].find((coord) => inside([lng, lat], coord)),
  );

  if (allLatviaLocation) {
    return allLatviaLocation.properties.id;
  }
}
