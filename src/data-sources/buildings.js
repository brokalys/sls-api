import { SQLDataSource } from 'datasource-sql';

import mysql from 'lib/db';

export default class Buildings extends SQLDataSource {
  getById(id) {
    const query = this.knex(`${process.env.DB_DATABASE}.buildings`).where(
      'id',
      id,
    );

    return mysql.query({
      sql: query.toString(),
      timeout: 1000,
    });
  }

  getInBounds(bounds) {
    const query = this.knex(
      `${process.env.DB_DATABASE}.buildings`,
    ).whereRaw('ST_Contains(ST_GeomFromText(?), bounds)', [
      `POLYGON((${bounds}))`,
    ]);

    return mysql.query({
      sql: query.toString(),
      timeout: 2000,
    });
  }
}
