import Knex from 'knex';
import path from 'path';
import ServerlessMysqlClient from './data-sources/client';

const config = {
  prod: {
    client: ServerlessMysqlClient,
  },

  test: {
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, '../test/db/migrations'),
    },
    seeds: {
      directory: path.join(__dirname, '../test/db/seeds'),
    },
  },
};

const isTestEnv = process.env.NODE_ENV === 'test';
const db = Knex(isTestEnv ? config.test : config.prod);

// A workaround to make SQLDataSource work
db.cache = {};

export default db;
