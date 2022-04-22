import schema from './validation';

describe('land: validation', () => {
  test('with valid data', () => {
    expect(
      schema.validate({
        id: 1,
      }).error,
    ).toBeUndefined();
  });

  test.each([
    [{ unknown: 'field' }], // unknown root field
    [{}],
    [undefined],
  ])('with invalid data: %j', (data) => {
    expect(schema.validate(data).error).not.toBeUndefined();
  });
});
