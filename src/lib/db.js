import serverlessMysql from 'serverless-mysql';
import Bugsnag from './bugsnag';

const mysql = serverlessMysql({
  config: {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  maxRetries: 5,
  onError: () => Bugsnag.setContext('serverless-mysql problem: onError'),
  onConnectError: () =>
    Bugsnag.setContext('serverless-mysql problem: onConnectError'),
  onKillError: () =>
    Bugsnag.setContext('serverless-mysql problem: onKillError'),
});

if (process.env.NODE_ENV !== 'test') {
  mysql.connect();
}

export default mysql;
