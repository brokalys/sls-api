import schema from './validation';

describe('properties: validation', () => {
  test('with valid data', () => {
    expect(
      schema.validate({ id: 'id-123', unsubscribe_key: 'test-123' }).error,
    ).toBeUndefined();
  });

  test.each([
    [{ id: '123' }], // missing unsubscribe key
    [{ unsubscribe_key: '123' }], // missing id
  ])('with invalid data: %j', (data) => {
    expect(schema.validate(data).error).not.toBeUndefined();
  });
});
