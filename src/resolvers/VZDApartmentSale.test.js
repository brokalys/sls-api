import resolvers from './VZDApartmentSale';

const apartment = {
  id: 202814,
  sale_id: 983294,
  object_type: 'Dz',
  cadastre_number: '42019001741',
  property_name: null,
  property_address: 'Vaļņu iela 37 - 4, Cēsis, Cēsu nov., LV-4101',
  property_county: 'Cēsu nov.',
  property_city: 'Cēsis',
  property_parish: null,
  sale_date: '2020-09-21T23:00:00.000Z',
  price: 12000,
  land_cadastral_designations: '42010053310',
  land_part_counter: 519,
  land_part_denominator: 3748,
  land_area_m2: 175,
  building_count: 2,
  building_cadastral_designation: '42010053310001',
  building_part_counter: 519,
  building_part_denominator: 3748,
  building_usage_name: 'Triju vai vairāku dzīvokļu mājas',
  building_usage_code: 1122,
  building_overground_floors: 2,
  building_area_m2: 290.7,
  building_total_area_m2: 517.9,
  building_volume_m3: 2042,
  building_outer_wall_material: '11 - Kokmateriāli',
  building_commissioning_year: '1900',
  building_depreciation_percentage: 65,
  building_cadastral_designations: '42010053310002, 42010053310001',
  space_group_count: 0,
  apartment_count: 1,
  space_cadastral_designations: '42010053310001004',
  space_group_counter: 1,
  space_group_denominator: 1,
  space_group_usage_code: 1122,
  space_group_lowest_floor: 2,
  space_group_highest_floor: 2,
  space_group_total_area_m2: 51.9,
  apartment_total_area_m2: 51.9,
  space_count_in_space_group: 3,
  room_count: 2,
};

describe('VZDApartmentSale', () => {
  describe('id', () => {
    it('returns id value', () => {
      const output = resolvers.id(apartment);
      expect(output).toEqual(apartment.id);
    });
  });

  describe('cadastre_number', () => {
    it('returns cadastre_number value', () => {
      const output = resolvers.cadastre_number(apartment);
      expect(output).toEqual(apartment.cadastre_number);
    });
  });

  describe('property_address', () => {
    it('returns property_address value', () => {
      const output = resolvers.property_address(apartment);
      expect(output).toEqual(apartment.property_address);
    });
  });

  describe('sale_date', () => {
    it('returns sale_date value', () => {
      const output = resolvers.sale_date(apartment);
      expect(output).toEqual(apartment.sale_date);
    });
  });

  describe('price', () => {
    it('returns price value', () => {
      const output = resolvers.price(apartment);
      expect(output).toEqual(apartment.price);
    });
  });

  describe('land_cadastral_designations', () => {
    it('returns land_cadastral_designations value', () => {
      const output = resolvers.land_cadastral_designations(apartment);
      expect(output).toEqual(apartment.land_cadastral_designations.split(', '));
    });

    it('returns an empty array if this apartment does not have land_cadastral_designations value', () => {
      const output = resolvers.land_cadastral_designations({
        ...apartment,
        land_cadastral_designations: null,
      });
      expect(output).toEqual([]);
    });
  });

  describe('land_area_m2', () => {
    it('returns land_area_m2 value', () => {
      const output = resolvers.land_area_m2(apartment);
      expect(output).toEqual(apartment.land_area_m2);
    });
  });

  describe('building_depreciation_percentage', () => {
    it('returns building_depreciation_percentage value', () => {
      const output = resolvers.building_depreciation_percentage(apartment);
      expect(output).toEqual(apartment.building_depreciation_percentage);
    });
  });

  describe('building_cadastral_designations', () => {
    it('returns building_cadastral_designations value', () => {
      const output = resolvers.building_cadastral_designations(apartment);
      expect(output).toEqual(
        apartment.building_cadastral_designations.split(', '),
      );
    });

    it('returns an empty array if this apartment does not have building_cadastral_designations value', () => {
      const output = resolvers.building_cadastral_designations({
        ...apartment,
        building_cadastral_designations: null,
      });
      expect(output).toEqual([]);
    });
  });

  describe('space_group_lowest_floor', () => {
    it('returns space_group_lowest_floor value', () => {
      const output = resolvers.space_group_lowest_floor(apartment);
      expect(output).toEqual(apartment.space_group_lowest_floor);
    });
  });

  describe('space_group_highest_floor', () => {
    it('returns space_group_highest_floor value', () => {
      const output = resolvers.space_group_highest_floor(apartment);
      expect(output).toEqual(apartment.space_group_highest_floor);
    });
  });

  describe('apartment_total_area_m2', () => {
    it('returns apartment_total_area_m2 value', () => {
      const output = resolvers.apartment_total_area_m2(apartment);
      expect(output).toEqual(apartment.apartment_total_area_m2);
    });
  });

  describe('room_count', () => {
    it('returns room_count value', () => {
      const output = resolvers.room_count(apartment);
      expect(output).toEqual(apartment.room_count);
    });
  });
});
