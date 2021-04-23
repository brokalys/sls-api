import Joi from 'lib/validator';

const schema = Joi.object({
  source: Joi.string().required(),
  url: Joi.string().uri().max(255),

  category: Joi.valid(
    'apartment',
    'house',
    'office',
    'land',
    'room',
    'new_project',
    'commercial',
    'garage',
    'forest',
    'garden_house',
    'house_part',
    'other',
  ),
  type: Joi.valid(
    'sell',
    'rent',
    'buy',
    'swap',
    'want_to_rent',
    'auction',
    'other',
  ),
  rent_type: Joi.valid(
    'yearly',
    'monthly',
    'weekly',
    'daily',
    'hourly',
    'unknown',
  ).default('unknown'),

  price: Joi.number(),
  price_per_sqm: Joi.number(),

  lat: Joi.number().unsafe().min(0).max(100),
  lng: Joi.number().unsafe().min(-180).max(180),

  location_district: Joi.string().trim().max(255),
  location_parish: Joi.string().trim().max(255),
  location_address: Joi.string().trim().max(255),
  location_village: Joi.string().trim().max(255),
  location_country: Joi.string().trim().max(255),

  rooms: Joi.number().integer(),
  area: Joi.number(),
  area_measurement: Joi.valid('m2'),
  land_area: Joi.number(),
  land_area_measurement: Joi.valid('m2', 'ha'),
  floor: Joi.number().integer(),
  max_floors: Joi.number().integer(),

  content: Joi.string()
    .replace(/(<([^>]+)>)/gi, '')
    .trim(),

  contact_phone: Joi.string().replace(/ /g, '').max(100),
  contact_phone2: Joi.string().replace(/ /g, '').max(100),
  contact_email: Joi.string().trim().max(255),
  contact_company: Joi.string().trim().max(255),

  building_project: Joi.string().trim().max(255),
  building_material: Joi.string().trim().max(255),

  images: Joi.array()
    .items(Joi.string().regex(/^http(s)?:\/\//i))
    .default([]),
  additional_data: Joi.object().default({}),
  published_at: Joi.date().iso(),
  foreign_id: Joi.string().max(100),
  cadastre_number: Joi.string(),
});

export default schema;
