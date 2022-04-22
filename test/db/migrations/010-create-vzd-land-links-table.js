exports.up = function (knex) {
  return knex.schema.createTable('vzd_land_links', (table) => {
    table.increments('id');
    table.string('cadastral_designation');
    table.integer('vzd_land_sale_id');
    table.integer('link_type');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('vzd_land_links');
};
