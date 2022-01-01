import BaseDataSource from './base';

class UserClassifieds extends BaseDataSource {
  create(values) {
    return this.knex('user_classifieds')
      .withSchema(process.env.DB_DATABASE)
      .insert(values);
  }
}

export default UserClassifieds;
