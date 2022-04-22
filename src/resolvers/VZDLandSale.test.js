import resolvers from './VZDLandSale';

const land = {
  id: 140546,
  cadastre_number: '76860060032',
  property_name: null,
  property_address: '"Bezdelīgactiņas", Turku pag., Līvānu nov., LV-5316',
  property_county: 'Līvānu nov.',
  property_city: null,
  property_parish: 'Turku pag.',
  sale_date: '2015-12-16T00:00:00.000Z',
  price: 39000,
  land_count: 1,
  land_cadastral_designations: '76860060032',
  land_built_up: 1,
  land_part_counter: 1,
  land_part_denominator: 1,
  land_total_area_m2: 479000.0,
  agricultural_land_area_m2: 180000.0,
  arable_land_area_m2: null,
  orchard_land_area_m2: null,
  meadow_land_area_m2: 180000.0,
  pasture_land_area_m2: null,
  ameliorated_land_area_m2: null,
  forest_land_area_m2: 233000.0,
  shrubbery_land_area_m2: 51000.0,
  swamp_land_area_m2: null,
  under_water_land_area_m2: 8000.0,
  under_pond_land_area_m2: null,
  under_buildings_land_area_m2: null,
  under_roads_land_area_m2: 7000.0,
  other_land_area_m2: 1512,
};

describe('VZDLandSale', () => {
  describe('id', () => {
    it('returns id value', () => {
      const output = resolvers.id(land);
      expect(output).toEqual(land.id);
    });
  });

  describe('sale_id', () => {
    it('returns sale_id value', () => {
      const output = resolvers.sale_id(land);
      expect(output).toEqual(land.sale_id);
    });
  });

  describe('cadastre_number', () => {
    it('returns cadastre_number value', () => {
      const output = resolvers.cadastre_number(land);
      expect(output).toEqual(land.cadastre_number);
    });
  });

  describe('property_address', () => {
    it('returns property_address value', () => {
      const output = resolvers.property_address(land);
      expect(output).toEqual(land.property_address);
    });
  });

  describe('sale_date', () => {
    it('returns sale_date value', () => {
      const output = resolvers.sale_date(land);
      expect(output).toEqual(land.sale_date);
    });
  });

  describe('price', () => {
    it('returns price value', () => {
      const output = resolvers.price(land);
      expect(output).toEqual(land.price);
    });
  });

  describe('land_cadastral_designations', () => {
    it('returns land_cadastral_designations value', () => {
      const output = resolvers.land_cadastral_designations(land);
      expect(output).toEqual(land.land_cadastral_designations.split(', '));
    });

    it('returns an empty array if this land does not have land_cadastral_designations value', () => {
      const output = resolvers.land_cadastral_designations({
        ...land,
        land_cadastral_designations: null,
      });
      expect(output).toEqual([]);
    });
  });

  describe('land_total_area_m2', () => {
    it('returns land_total_area_m2 value', () => {
      const output = resolvers.land_total_area_m2(land);
      expect(output).toEqual(land.land_total_area_m2);
    });
  });
});
