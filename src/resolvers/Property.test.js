import BuildingsDataSource from 'data-sources/buildings';
import resolvers from './Property';

jest.mock('data-sources/buildings');

const property = {
  id: 1,
  url: 'https://brokalys.com',
  category: 'apartment',
  type: 'sell',
  content: 'Hello World!',
  images: '["https://brokalys.com/logo.png"]',
  price: 50000,
  calc_price_per_sqm: 1000,
  retn_type: 'unknown',
  rooms: 1,
  area: 50,
  floor: 3,
  lat: 56.7,
  lng: 24.1,
  foreign_id: 'id-123',
  published_at: '2020-01-01T00:00:10.000Z',
  building_id: 123,
};

describe('Property', () => {
  let dataSources;

  beforeEach(() => {
    dataSources = {
      buildings: BuildingsDataSource,
    };
  });

  describe('id', () => {
    it('returns id value', () => {
      const output = resolvers.id(property);
      expect(output).toEqual(property.id);
    });
  });

  describe('url', () => {
    it('returns url value', () => {
      const output = resolvers.url(property);
      expect(output).toEqual(property.url);
    });
  });

  describe('category', () => {
    it('returns category value', () => {
      const output = resolvers.category(property);
      expect(output).toEqual(property.category);
    });
  });

  describe('type', () => {
    it('returns type value', () => {
      const output = resolvers.type(property);
      expect(output).toEqual(property.type);
    });
  });

  describe('content', () => {
    it('returns content value', () => {
      const output = resolvers.content(property);
      expect(output).toEqual(property.content);
    });

    it('returns an empty string if this property does not have content value', () => {
      const output = resolvers.content({ ...property, content: null });
      expect(output).toEqual('');
    });
  });

  describe('images', () => {
    it('returns images value', () => {
      const output = resolvers.images(property);
      expect(output).toEqual(JSON.parse(property.images));
    });

    it('returns an empty array if the property has no images', () => {
      const output = resolvers.images({ ...property, images: '' });
      expect(output).toEqual([]);
    });
  });

  describe('price', () => {
    it('returns price value', () => {
      const output = resolvers.price(property);
      expect(output).toEqual(property.price);
    });
  });

  describe('price_per_sqm', () => {
    it('returns calc_price_per_sqm value', () => {
      const output = resolvers.price_per_sqm(property);
      expect(output).toEqual(property.calc_price_per_sqm);
    });
  });

  describe('calc_price_per_sqm', () => {
    it('returns calc_price_per_sqm value', () => {
      const output = resolvers.calc_price_per_sqm(property);
      expect(output).toEqual(property.calc_price_per_sqm);
    });
  });

  describe('rent_type', () => {
    it('returns rent_type value if property.type is rent and rent_type is set', () => {
      const output = resolvers.rent_type({
        ...property,
        type: 'rent',
        rent_type: 'monthly',
      });
      expect(output).toEqual('monthly');
    });

    it('returns default rent_type value if property.type is rent and rent type is not set', () => {
      const output = resolvers.rent_type({ ...property, type: 'rent' });
      expect(output).toEqual('unknown');
    });

    it('returns undefined if property.type is not rent', () => {
      const output = resolvers.rent_type({ ...property, type: 'sell' });
      expect(output).toBeUndefined();
    });
  });

  describe('rooms', () => {
    it('returns rooms value', () => {
      const output = resolvers.rooms(property);
      expect(output).toEqual(property.rooms);
    });
  });

  describe('area', () => {
    it('returns area value', () => {
      const output = resolvers.area(property);
      expect(output).toEqual(property.area);
    });
  });

  describe('floor', () => {
    it('returns floor value', () => {
      const output = resolvers.floor(property);
      expect(output).toEqual(property.floor);
    });
  });

  describe('lat', () => {
    it('returns lat value', () => {
      const output = resolvers.lat(property);
      expect(output).toEqual(property.lat);
    });
  });

  describe('lng', () => {
    it('returns lng value', () => {
      const output = resolvers.lng(property);
      expect(output).toEqual(property.lng);
    });
  });

  describe('foreign_id', () => {
    it('returns foreign_id value', () => {
      const output = resolvers.foreign_id(property);
      expect(output).toEqual(property.foreign_id);
    });
  });

  describe('published_at', () => {
    it('returns published_at value if date is after 2017', () => {
      const output = resolvers.published_at(property);
      expect(output).toEqual(property.published_at);
    });

    it('returns published_at value if date is before 2018', () => {
      const output = resolvers.published_at({
        ...property,
        published_at: '2010-01-01T00:00:00.000Z',
      });
      expect(output).toBeUndefined();
    });
  });

  describe('building', () => {
    it('forwards the `building_id` field to the data-source getter if `building_id` is set', () => {
      const mockBuilding = {
        id: property.building_id,
      };
      BuildingsDataSource.getById.mockReturnValueOnce(mockBuilding);

      const output = resolvers.building(property, {}, { dataSources });

      expect(BuildingsDataSource.getById).toBeCalled();
      expect(output).toEqual(mockBuilding);
    });

    it('does not forward the `building_id` field to the data-source getter if `building_id` is empty', () => {
      const output = resolvers.building(
        {
          ...property,
          building_id: null,
        },
        {},
        { dataSources },
      );

      expect(BuildingsDataSource.getById).not.toBeCalled();
      expect(output).toBeNull();
    });
  });
});
