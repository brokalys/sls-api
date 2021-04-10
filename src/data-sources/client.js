import MysqlClient from 'knex/lib/dialects/mysql';
import mysql from 'lib/db';

export default class ServerlessMysqlClient extends MysqlClient {
  get dialect() {
    return 'serverlessMysql';
  }
  get driverName() {
    return 'serverlessMysql';
  }

  acquireConnection() {
    return Promise.resolve(mysql);
  }

  releaseConnection() {
    return mysql.end();
  }
}
