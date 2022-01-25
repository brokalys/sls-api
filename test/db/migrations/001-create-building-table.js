exports.up = function (knex) {
  return knex.schema.createTable('vzd_buildings', (table) => {
    table.increments('id');
    table.json('bounds');
    table.string('cadastral_designation');
    table.string('city');
    table.string('street');
    table.string('house_number');
    table.string('location_classificator');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('vzd_buildings');
};
