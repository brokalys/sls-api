import BaseDataSource from './base';

export default class Buildings extends BaseDataSource {
  getById(id) {
    return this.getDataLoader(
      this.knex('buildings').withSchema(process.env.DB_DATABASE),
    )
      .load(id)
      .then(([result]) => result);
  }

  getInBounds(bounds) {
    return this.knex('buildings')
      .withSchema(process.env.DB_DATABASE)
      .whereInBounds(bounds);
  }
}
