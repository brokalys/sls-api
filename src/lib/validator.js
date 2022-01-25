import area from 'area-polygon';
import Joi from 'joi';
import gjv from 'geojson-validation';

export default Joi.extend((joi) => ({
  type: 'string',
  base: Joi.string(),
  messages: {
    'string.polygon': '{{#label}} needs to be a valid polygon',
    'string.maxArea': '{{#label}} are must not exceed {{#area}}',
  },
  rules: {
    polygon: {
      validate(value, helpers, args, options) {
        const parts = [
          value.split(',').map((p) =>
            p
              .trim()
              .split(' ')
              .map((r) => (isNaN(r) ? r : parseFloat(r))),
          ),
        ];

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

    maxArea: {
      method(area) {
        return this.$_addRule({ name: 'maxArea', args: { area } });
      },
      validate(value, helpers, args, options) {
        const parts = value.split(',').map((p) =>
          p
            .trim()
            .split(' ')
            .map((r) => (isNaN(r) ? r : parseFloat(r))),
        );

        if (area(parts) > args.area) {
          return helpers.error('string.maxArea', { area: args.area });
        }

        return value;
      },
    },
  },
})).extend((joi) => ({
  type: 'object',
  base: joi.object(),
  rules: {
    filterOf: {
      method(field) {
        return joi.object({
          eq: field,
          neq: field,

          gt: field,
          gte: field,
          lt: field,
          lte: field,

          in: joi.array().items(field),
          nin: joi.array().items(field),
        });
      },
    },
  },
}));
