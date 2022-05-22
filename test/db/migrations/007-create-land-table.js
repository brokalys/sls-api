exports.up = function (knex) {
  return knex.schema.createTable('vzd_land', (table) => {
    table.increments('id');
    table.json('bounds');
    table.string('cadastral_designation');
    table.string('object_code');
    table.integer('area');
    table.string('group_code');
    table.string('location_classificator');
    table.boolean('is_usable');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('vzd_land');
};
