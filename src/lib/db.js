import serverlessMysql from 'serverless-mysql';

const mysql = serverlessMysql({
  config: {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  maxRetries: 5,
});

if (process.env.NODE_ENV !== 'test') {
  mysql.connect();
}

export default mysql;
