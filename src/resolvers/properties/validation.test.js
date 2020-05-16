import schema from './validation';

describe('properties: validation', () => {
  test.each([
    [{ filter: { published_at: '2018-12-01' } }],
    [{ filter: { category: 'APARTMENT' } }],
    [{ filter: { category: 'apartment' } }],
    [{ filter: {} }],
    [{}],
    [undefined],
  ])('with valid data: %j', (data) => {
    expect(schema.validate(data).error).toBeUndefined();
  });

  test.each([
    [{ filter: { published_at: '2020-01-01' } }], // too far in future
    [{ filter: { published_at: '2018-01-01' } }], // too far in past
    [{ filter: { category: 'unknown' } }], // unknown category filter
    [{ filter: { category: 123 } }], // wrong type
    [{ filter: { unknown: 'field' } }], // unknown filter
    [{ unknown: 'field' }], // unknown root field filter
  ])('with invalid data: %j', (data) => {
    expect(schema.validate(data).error).not.toBeUndefined();
  });
});
