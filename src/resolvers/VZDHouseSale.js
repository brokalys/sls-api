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
  land_total_area_m2: (item) => item.land_total_area_m2,
  building_cadastral_designation: (item) => item.building_cadastral_designation,
  building_overground_floors: (item) => item.building_overground_floors,
  building_total_area_m2: (item) => item.building_total_area_m2,
  building_commissioning_year: (item) => item.building_commissioning_year,
  building_outer_wall_material: (item) => item.building_outer_wall_material,
  building_depreciation_percentage: (item) =>
    item.building_depreciation_percentage,
};
