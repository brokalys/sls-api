import resolvers from './VZDHouseSale';

const house = {
  id: 140546,
  sale_id: 724714,
  object_type: 'Zeme ar ēkām',
  cadastre_number: '01000930259',
  property_name: null,
  property_address: 'Imantas 8. līnija 10, Rīga, LV-1083',
  property_county: null,
  property_city: 'Rīga',
  property_parish: null,
  sale_date: '2015-12-16T00:00:00.000Z',
  price: 39000,
  land_count: 1,
  land_cadastral_designations: '01000930259',
  land_part_counter: 1,
  land_part_denominator: 1,
  land_total_area_m2: 1512,
  agricultural_land_area_m2: 0,
  arable_land_area_m2: null,
  orchard_land_area_m2: null,
  meadow_land_area_m2: null,
  pasture_land_area_m2: null,
  ameliorated_land_area_m2: null,
  forest_land_area_m2: null,
  shrubbery_land_area_m2: null,
  swamp_land_area_m2: null,
  under_water_land_area_m2: null,
  under_pond_land_area_m2: null,
  under_buildings_land_area_m2: null,
  under_roads_land_area_m2: null,
  other_land_area_m2: 1512,
  building_count: 4,
  building_cadastral_designation: '01000930259002',
  building_part_counter: 1,
  building_part_denominator: 1,
  building_usage_name: 'Citas, iepriekš neklasificētas, ēkas',
  building_usage_code: 1274,
  building_overground_floors: 0,
  building_area_m2: 9,
  building_total_area_m2: 9,
  building_volume_m3: 11,
  building_commissioning_year: '1946',
  building_outer_wall_material: 'Silikātķieģeļi',
  building_depreciation_percentage: 60,
  created_at: '2022-01-16T15:58:13.000Z',
};

describe('VZDHouseSale', () => {
  describe('id', () => {
    it('returns id value', () => {
      const output = resolvers.id(house);
      expect(output).toEqual(house.id);
    });
  });

  describe('cadastre_number', () => {
    it('returns cadastre_number value', () => {
      const output = resolvers.cadastre_number(house);
      expect(output).toEqual(house.cadastre_number);
    });
  });

  describe('property_address', () => {
    it('returns property_address value', () => {
      const output = resolvers.property_address(house);
      expect(output).toEqual(house.property_address);
    });
  });

  describe('sale_date', () => {
    it('returns sale_date value', () => {
      const output = resolvers.sale_date(house);
      expect(output).toEqual(house.sale_date);
    });
  });

  describe('price', () => {
    it('returns price value', () => {
      const output = resolvers.price(house);
      expect(output).toEqual(house.price);
    });
  });

  describe('land_cadastral_designations', () => {
    it('returns land_cadastral_designations value', () => {
      const output = resolvers.land_cadastral_designations(house);
      expect(output).toEqual(house.land_cadastral_designations.split(', '));
    });

    it('returns an empty array if this house does not have land_cadastral_designations value', () => {
      const output = resolvers.land_cadastral_designations({
        ...house,
        land_cadastral_designations: null,
      });
      expect(output).toEqual([]);
    });
  });

  describe('land_total_area_m2', () => {
    it('returns land_total_area_m2 value', () => {
      const output = resolvers.land_total_area_m2(house);
      expect(output).toEqual(house.land_total_area_m2);
    });
  });

  describe('building_depreciation_percentage', () => {
    it('returns building_depreciation_percentage value', () => {
      const output = resolvers.building_depreciation_percentage(house);
      expect(output).toEqual(house.building_depreciation_percentage);
    });
  });

  describe('building_cadastral_designation', () => {
    it('returns building_cadastral_designation value', () => {
      const output = resolvers.building_cadastral_designation(house);
      expect(output).toEqual(house.building_cadastral_designation);
    });
  });

  describe('building_overground_floors', () => {
    it('returns building_overground_floors value', () => {
      const output = resolvers.building_overground_floors(house);
      expect(output).toEqual(house.building_overground_floors);
    });
  });

  describe('building_total_area_m2', () => {
    it('returns building_total_area_m2 value', () => {
      const output = resolvers.building_total_area_m2(house);
      expect(output).toEqual(house.building_total_area_m2);
    });
  });

  describe('building_commissioning_year', () => {
    it('returns building_commissioning_year value', () => {
      const output = resolvers.building_commissioning_year(house);
      expect(output).toEqual(house.building_commissioning_year);
    });
  });

  describe('building_outer_wall_material', () => {
    it('returns building_outer_wall_material value', () => {
      const output = resolvers.building_outer_wall_material(house);
      expect(output).toEqual(house.building_outer_wall_material);
    });
  });

  describe('building_depreciation_percentage', () => {
    it('returns building_depreciation_percentage value', () => {
      const output = resolvers.building_depreciation_percentage(house);
      expect(output).toEqual(house.building_depreciation_percentage);
    });
  });
});
