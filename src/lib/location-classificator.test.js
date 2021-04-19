import getLocationClassificator from './location-classificator';

describe('getLocationClassificator', () => {
  test.each([
    [56.91949535, 24.01729442, 'latvia-marupes-novads'],
    [56.91940396, 24.01843071, 'latvia-marupes-novads'],
    [56.91918143, 24.01534081, 'latvia-marupes-novads'],
    [56.91906, 24.01539, 'latvia-marupes-novads'],
    [56.91926342, 24.01765823, 'latvia-marupes-novads'],
  ])(
    'classifies the location correctly: %j, %j as %s',
    (lat, lng, expectation) => {
      const output = getLocationClassificator(lat, lng);
      expect(output).toEqual(expectation);
    },
  );
});
