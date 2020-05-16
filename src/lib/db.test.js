import db from './db';

describe('db', () => {
  test('creates a MySQL instance', () => {
    expect(db).toBeDefined();
    expect(db.query).toBeInstanceOf(Function);
  });
});
