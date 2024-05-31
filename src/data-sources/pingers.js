import BaseDataSource from './base';

const TABLE_NAME = 'pinger_emails';

export default class Pingers extends BaseDataSource {
  get({ id, unsubscribe_key: unsubscribeKey }, fields = undefined) {
    const query = this.knex(`${TABLE_NAME} as p1`)
      .withSchema(process.env.DB_PINGER_DATABASE)
      .where('p1.id_hash', id)
      .where('p1.unsubscribe_key', unsubscribeKey)
      .join(`${TABLE_NAME} as p2`, 'p2.email', '=', 'p1.email')
      .timeout(5000);

    if (fields) {
      query.select(fields.map((field) => `p1.${field}`));
    }

    return query;
  }

  loadMany(ids, fields) {
    return this.getDataLoader(
      this.knex(TABLE_NAME).withSchema(process.env.DB_PINGER_DATABASE),
      'id_hash',
    )
      .loadMany(ids)
      .then((results) => results.map(([data]) => data));
  }
}
