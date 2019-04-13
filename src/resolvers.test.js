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

  test('has createPinger mutation', () => {
    expect(resolvers.Mutation.createPinger).toBeDefined();
  });

  test('has unsubscribePinger mutation', () => {
    expect(resolvers.Mutation.unsubscribePinger).toBeDefined();
  });
});
