import { resolvers } from './resolvers';

describe('resolvers', () => {
  test('has Date resolver', () => {
    expect(resolvers.Date).toBeDefined();
  });

  test('has getRegions query', () => {
    expect(resolvers.Query.getRegions).toBeDefined();
  });

  test('has getRegion query', () => {
    expect(resolvers.Query.getRegion).toBeDefined();
  });
});
