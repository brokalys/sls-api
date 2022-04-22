import moment from 'moment';

export default {
  id: (item) => item.id,
  sale_id: (item) => item.sale_id,
  cadastre_number: (item) => item.cadastre_number,
  property_address: (item) => item.property_address,
  sale_date: (item) => moment(item.sale_date).toISOString(),
  price: (item) => item.price,
  land_cadastral_designations: (item) =>
    item.land_cadastral_designations
      ? item.land_cadastral_designations.split(', ')
      : [],
  land_total_area_m2: (item) => item.land_total_area_m2,
};
