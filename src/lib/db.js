import serverlessMysql from 'serverless-mysql';

const mysql = serverlessMysql({
  config: {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  onError: () => {
    console.log('onError');
  },
  onClose: () => {
    console.log('onClose');
  },
  onConnect: () => {
    console.log('onConnect');
  },
  onConnectError: () => {
    console.log('onConnectError');
  },
  onKill: () => {
    console.log('onKill');
  },
  onKillError: () => {
    console.log('onKillError');
  },
  onRetry: () => {
    console.log('onRetry');
  },
  maxRetries: 5,
});

export default mysql;
