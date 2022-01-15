import moment from 'moment';

export default {
  id: (item) => item.id,
  cadastre_number: (item) => item.cadastre_number,
  property_address: (item) => item.property_address,
  sale_date: (item) => moment(item.sale_date).toISOString(),
  price: (item) => item.price,
  land_cadastral_designations: (item) =>
    item.land_cadastral_designations
      ? item.land_cadastral_designations.split(', ')
      : [],
  land_area_m2: (item) => item.land_area_m2,
  building_depreciation_percentage: (item) =>
    item.building_depreciation_percentage,
  building_cadastral_designations: (item) =>
    item.building_cadastral_designations
      ? item.building_cadastral_designations.split(', ')
      : [],
  space_group_lowest_floor: (item) => item.space_group_lowest_floor,
  space_group_highest_floor: (item) => item.space_group_highest_floor,
  apartment_total_area_m2: (item) => item.apartment_total_area_m2,
  room_count: (item) => item.room_count,
};
