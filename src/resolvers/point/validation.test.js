import schema from './validation';

describe('properties: validation', () => {
  test('with valid coordinates', () => {
    const { error: output } = schema.validate({
      lat: 56.942285,
      lng: 24.088706,
    });

    expect(output).toBeUndefined();
  });

  test.each([
    [{ lat: 56.123 }], // missing lat
    [{ lng: 24.123 }], // missing lng
    [undefined], // nothing
  ])('with invalid data: %j', (data) => {
    const { error: output } = schema.validate(data);

    expect(output).not.toBeUndefined();
  });
});
