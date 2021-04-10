import { SQLDataSource } from 'datasource-sql';
import KnexDataLoader from './data-loader';

export default class BaseDataSource extends SQLDataSource {
  constructor(knexConfig) {
    super(knexConfig);

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

    const loader = new KnexDataLoader(query, keyField);

    this.loaders.set(hash, loader);
    return loader;
  }
}
