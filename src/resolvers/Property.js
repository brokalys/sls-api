import moment from 'moment';

export default {
  id: (item) => item.id,
  url: (item) => item.url,
  category: (item) => item.category,
  type: (item) => item.type,
  content: (item) => item.content || '',
  images: (item) => (item.images ? JSON.parse(item.images) : []),
  price: (item) => item.price,
  price_per_sqm: (item) => item.calc_price_per_sqm,
  calc_price_per_sqm: (item) => item.calc_price_per_sqm,
  rent_type: (item) =>
    item.type === 'rent' ? item.rent_type || 'unknown' : undefined,
  rooms: (item) => item.rooms,
  area: (item) => item.area,
  floor: (item) => item.floor,
  lat: (item) => item.lat,
  lng: (item) => item.lng,
  foreign_id: (item) => item.foreign_id,
  published_at: (item) =>
    moment(item.published_at).isBefore('2018-01-01')
      ? undefined
      : moment(item.published_at).toISOString(),
  building: (item, input, context) =>
    item.building_id && context.dataSources.buildings.getById(item.building_id),
};
