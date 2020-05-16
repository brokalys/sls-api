import schema from './validation';

describe('properties: validation', () => {
  test.each([
    [{ filter: { published_at: '2018-12-01' } }],
    [{ filter: { category: 'APARTMENT' } }],
    [{ filter: { category: 'apartment' } }],
    [
      {
        filter: {
          region:
            '56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176, 56.992294 24.136619',
        },
      },
    ],
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
    [
      {
        filter: {
          region:
            '56.992294 24.136619, 56.976394 23.995790, 56.924904 24.005336, 56.889288 24.108467, 56.932211 24.291935, 56.996502 24.245176',
        },
      },
    ], // Invalid region (missing ending point)
    [{ filter: { region: 'wrong' } }], // Invalid region
    [{ unknown: 'field' }], // unknown root field filter
  ])('with invalid data: %j', (data) => {
    expect(schema.validate(data).error).not.toBeUndefined();
  });
});
