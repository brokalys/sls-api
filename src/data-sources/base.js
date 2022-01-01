import DataLoader from 'dataloader';
import { SQLDataSource } from 'datasource-sql';
import '../knex-extensions';

export default class BaseDataSource extends SQLDataSource {
  constructor(knexConfig) {
    super(knexConfig);

    this.config = knexConfig;
    this.loaders = new Map();
  }

  getDataLoader(query, keyField = 'id') {
    // Add the key field if this is not a get-all query
    if (keyField && !/^select \* /i.test(query.toString())) {
      query.select(keyField);
    }

    const hash = query.toString();

    if (this.loaders.has(hash)) {
      return this.loaders.get(hash);
    }

    const loader = new DataLoader(batchGet(query, keyField));

    this.loaders.set(hash, loader);
    return loader;
  }
}

function batchGet(query, keyField) {
  return async (ids) => {
    const data = await query.whereIn(keyField, ids);

    const map = new Map();
    ids.forEach((item) => map.set(item, []));
    data.forEach((item) => map.get(item[keyField]).push(item));
    return ids.map((id) => map.get(id));
  };
}
