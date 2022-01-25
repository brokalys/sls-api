import schema from './validation';

describe('buildings: validation', () => {
  test.each([
    [
      {
        bounds:
          '56.944756215513316 24.09404948877113, 56.9404253703127 24.09404948877113, 56.9404253703127 24.086952363717725, 56.944756215513316 24.086952363717725, 56.944756215513316 24.09404948877113',
      },
    ],
  ])('with valid data: %j', (data) => {
    expect(schema().validate(data).error).toBeUndefined();
  });

  test.each([
    [
      {
        bounds:
          '57.0510741522279 24.34369621296768, 56.86735048784755 24.34369621296768, 56.86735048784755 23.842917061051175, 57.0510741522279 23.842917061051175, 57.0510741522279 24.34369621296768',
      },
    ][{ unknown: 'field' }], // unknown root field
    [{}],
    [undefined],
  ])('with invalid data: %j', (data) => {
    expect(schema().validate(data).error).not.toBeUndefined();
  });
});
