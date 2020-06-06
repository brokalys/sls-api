import resolvers from './summary';

describe('property-price-summary', () => {
  describe('min', () => {
    it('returns min value of an array', () => {
      const input = [50, 40, 10, 200];
      const output = resolvers.min({ prices: input });
      expect(output).toEqual(10);
    });

    it('returns null if the input array is empty', () => {
      const input = [];
      const output = resolvers.min({ prices: input });
      expect(output).toBeNull();
    });
  });

  describe('max', () => {
    it('returns max value of an array', () => {
      const input = [50, 40, 10, 200];
      const output = resolvers.max({ prices: input });
      expect(output).toEqual(200);
    });

    it('returns null if the input array is empty', () => {
      const input = [];
      const output = resolvers.max({ prices: input });
      expect(output).toBeNull();
    });
  });

  describe('mean', () => {
    it('returns mean value of an array', () => {
      const input = [50, 40, 10, 200, 300, 100, 50, 10, 90, 20];
      const output = resolvers.mean({ prices: input });
      expect(output).toEqual(87);
    });

    it('returns null if the input array is empty', () => {
      const input = [];
      const output = resolvers.mean({ prices: input });
      expect(output).toBeNull();
    });
  });

  describe('median', () => {
    it('returns median value of an array', () => {
      const input = [50, 40, 10, 200, 300, 100, 50, 10, 90, 20];
      const output = resolvers.median({ prices: input });
      expect(output).toEqual(50);
    });

    it('returns null if the input array is empty', () => {
      const input = [];
      const output = resolvers.median({ prices: input });
      expect(output).toBeNull();
    });
  });

  describe('mode', () => {
    it('returns mode value of an array', () => {
      const input = [50, 40, 10, 200, 300, 100, 50, 10, 90, 20];
      const output = resolvers.mode({ prices: input });
      expect(output).toEqual(10);
    });

    it('returns null if the input array is empty', () => {
      const input = [];
      const output = resolvers.mode({ prices: input });
      expect(output).toBeNull();
    });
  });

  describe('standardDev', () => {
    it('returns standardDev value of an array', () => {
      const input = [50, 40, 10, 200, 300, 100, 50, 10, 90, 20];
      const output = resolvers.standardDev({ prices: input });
      expect(output).toEqual(89);
    });

    it('returns null if the input array is empty', () => {
      const input = [];
      const output = resolvers.standardDev({ prices: input });
      expect(output).toBeNull();
    });
  });
});
