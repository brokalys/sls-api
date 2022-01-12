exports.up = function (knex) {
  return knex.schema.createTable('property_building_links', (table) => {
    table.increments('id');
    table.integer('property_id');
    table.integer('vzd_building_id');
    table.integer('link_type');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('property_building_links');
};
