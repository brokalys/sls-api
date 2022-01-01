exports.up = function (knex) {
  return knex.schema.createTable('buildings', (table) => {
    table.increments('id');
    table.json('bounds');
    table.string('addr_city');
    table.string('addr_country', 2);
    table.string('addr_housenumber');
    table.string('addr_street');
    table.string('addr_postcode', 10);
    table.string('building');
    table.integer('building_levels');
    table.integer('osm_id');
    table.string('city');
    table.string('street');
    table.string('housenumber');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('buildings');
};
