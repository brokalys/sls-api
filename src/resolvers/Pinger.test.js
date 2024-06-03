import resolvers from './Pinger';

const pinger = {
  id_hash: 'id-123',
  categories: '["apartment"]',
  types: '["sell"]',
  price_min: 10000,
  price_max: 100000,
  price_type: 'total',
  location: '',
  rooms_min: null,
  rooms_max: null,
  area_m2_min: null,
  area_m2_max: null,
  frequency: 'immediate',
  comments: '',
  marketing: true,
  created_at: '2020-01-01T00:00:10.000Z',
  unsubscribed_at: null,
  unsubscribe_key: 'key-123',
};

describe('Pinger', () => {
  describe('id', () => {
    it('returns id value', () => {
      const output = resolvers.id(pinger);
      expect(output).toEqual(pinger.id_hash);
    });
  });

  describe('email', () => {
    it('returns email value', () => {
      const output = resolvers.email(pinger);
      expect(output).toEqual(pinger.email);
    });
  });

  describe('category', () => {
    it('returns category value', () => {
      const output = resolvers.category(pinger);
      expect(output).toEqual('APARTMENT');
    });
  });

  describe('type', () => {
    it('returns type value', () => {
      const output = resolvers.type(pinger);
      expect(output).toEqual('SELL');
    });
  });

  describe('price_min', () => {
    it('returns price_min value', () => {
      const output = resolvers.price_min(pinger);
      expect(output).toEqual(pinger.price_min);
    });
  });

  describe('price_max', () => {
    it('returns price_max value', () => {
      const output = resolvers.price_max(pinger);
      expect(output).toEqual(pinger.price_max);
    });
  });

  describe('price_type', () => {
    it('returns price_type value', () => {
      const output = resolvers.price_type(pinger);
      expect(output).toEqual(pinger.price_type.toUpperCase());
    });
  });

  describe('region', () => {
    it('returns region value', () => {
      const output = resolvers.region(pinger);
      expect(output).toEqual(pinger.location);
    });
  });

  describe('rooms_min', () => {
    it('returns rooms_min value', () => {
      const output = resolvers.rooms_min(pinger);
      expect(output).toEqual(pinger.rooms_min);
    });
  });

  describe('rooms_max', () => {
    it('returns rooms_max value', () => {
      const output = resolvers.rooms_max(pinger);
      expect(output).toEqual(pinger.rooms_max);
    });
  });

  describe('area_m2_min', () => {
    it('returns area_m2_min value', () => {
      const output = resolvers.area_m2_min(pinger);
      expect(output).toEqual(pinger.area_m2_min);
    });
  });

  describe('area_m2_max', () => {
    it('returns area_m2_max value', () => {
      const output = resolvers.area_m2_max(pinger);
      expect(output).toEqual(pinger.area_m2_max);
    });
  });

  describe('frequency', () => {
    it('returns frequency value', () => {
      const output = resolvers.frequency(pinger);
      expect(output).toEqual(pinger.frequency.toUpperCase());
    });
  });

  describe('comments', () => {
    it('returns comments value', () => {
      const output = resolvers.comments(pinger);
      expect(output).toEqual(pinger.comments);
    });
  });

  describe('marketing', () => {
    it('returns marketing value', () => {
      const output = resolvers.marketing(pinger);
      expect(output).toEqual(pinger.marketing);
    });
  });

  describe('created_at', () => {
    it('returns created_at value', () => {
      const output = resolvers.created_at(pinger);
      expect(output).toEqual(pinger.created_at);
    });
  });

  describe('unsubscribed_at', () => {
    it('returns unsubscribed_at value', () => {
      const output = resolvers.unsubscribed_at(pinger);
      expect(output).toEqual(pinger.unsubscribed_at);
    });
  });

  describe('unsubscribe_key', () => {
    it('returns unsubscribe_key value', () => {
      const output = resolvers.unsubscribe_key(pinger);
      expect(output).toEqual(pinger.unsubscribe_key);
    });
  });
});
