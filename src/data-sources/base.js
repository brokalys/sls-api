import DataLoader from 'dataloader';
import { SQLDataSource } from 'datasource-sql';
import '../knex-extensions';

export default class BaseDataSource extends SQLDataSource {
  constructor(knexConfig) {
    super(knexConfig);

    this.config = knexConfig;
    this.loaders = new Map();
  }

  getDataLoader(query, selectField = 'id', keyField = selectField) {
    // Add the key field if this is not a get-all query
    if (!/^select \* /i.test(query.toString())) {
      query.select(selectField);
    }

    const hash = query.toString();

    if (this.loaders.has(hash)) {
      return this.loaders.get(hash);
    }

    const loader = new DataLoader(batchGet(query, selectField, keyField));

    this.loaders.set(hash, loader);
    return loader;
  }
}

function batchGet(query, selectField, keyField) {
  return async (ids) => {
    const data = await query.whereIn(selectField, ids);

    const map = new Map();
    ids.forEach((item) => map.set(item, []));
    data.forEach((item) => map.get(item[keyField]).push(item));
    return ids.map((id) => map.get(id));
  };
}
