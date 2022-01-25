import schema from './validation';

describe('properties: validation', () => {
  test.each([
    [{ filter: { published_at: { gte: '2018-12-01' } } }],
    [{ filter: { created_at: { gte: '2018-12-01' } } }],
    [{ filter: { category: { eq: 'APARTMENT' } } }],
    [{ filter: { category: { eq: 'apartment' } } }],
    [{ filter: { category: { eq: 'office' } } }],
    [{ filter: { type: { eq: 'SELL' } } }],
    [{ filter: { type: { eq: 'sell' } } }],
    [{ filter: { type: { eq: 'auction' } } }],
    [{ filter: { price: { gt: 20000 } } }],
    [{ filter: { location_classificator: { eq: 'latvia-riga-centrs' } } }],
    [{ filter: { rooms: { gt: 2, lte: 3 } } }],
    [{ filter: { floor: { gt: 2, lte: 5 } } }],
    [{ filter: { area: { gt: 40 } } }],
    [{ filter: { source: { eq: 'brokalys.com' } } }],
    [{ filter: { source: { eq: 'mm-lv' } } }],
    [{ filter: { url: { eq: 'https://brokalys.com' } } }],
    [{ filter: { foreign_id: { eq: 'id123' } } }],
    [{ filter: {} }],
    [{ limit: null }],
    [{ limit: 20 }],
    [{}],
    [undefined],
  ])('with valid data: %j', (data) => {
    expect(schema.validate(data).error).toBeUndefined();
  });

  test.each([
    [{ filter: { category: { eq: 'unknown' } } }], // unknown category filter
    [{ filter: { category: { eq: 123 } } }], // wrong type
    [{ filter: { category: { unknown: 'APARTMENT' } } }], // wrong filter type
    [{ filter: { type: { eq: 'sellxxxx' } } }], // unknown type filter
    [{ filter: { unknown: { eq: 'field' } } }], // unknown filter
    [{ filter: { unknown: 'field' } }], // unknown filter
    [{ filter: { url: { eq: 'brokalys.com' } } }], // missing protocol
    [{ filter: { foreign_id: { eq: 'ALPHA + NUM & ONLY' } } }], // alphanum only
    [{ filter: { location_classificator: { eq: 123 } } }], // string only
    [{ filter: { region: { in: ['wrong'] } } }], // Invalid region
    [{ limit: 0 }], // Too small
    [{ limit: '10' }], // Invalid datatype
    [{ limit: true }], // Invalid datatype
    [{ limit: false }], // Invalid datatype
    [{ unknown: 'field' }], // unknown root field filter
  ])('with invalid data: %j', (data) => {
    expect(schema.validate(data).error).not.toBeUndefined();
  });
});
