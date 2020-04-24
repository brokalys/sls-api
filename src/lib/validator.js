import Joi from '@hapi/joi';
import gjv from 'geojson-validation';

export default Joi.extend((joi) => ({
  type: 'string',
  base: Joi.string(),
  messages: {
    'string.polygon': '{{#label}} needs to be a valid polygon',
  },
  rules: {
    polygon: {
      validate(value, helpers, args, options) {
        const parts = [
          value.split(',').map((p) =>
            p
              .trim()
              .split(' ')
              .map((r) => parseFloat(r)),
          ),
        ];
        parts[0].push(parts[0][0]);

        const geojson = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: parts,
          },
          properties: {},
        };

        if (!gjv.valid(geojson)) {
          return helpers.error('string.polygon');
        }

        return value;
      },
    },
  },
}));
