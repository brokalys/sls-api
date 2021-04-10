exports.up = function (knex) {
  return knex.schema.createTable('properties', (table) => {
    table.increments('id');
    table.string('source');
    table.string('url');
    table.string('category');
    table.string('type');
    table.string('rent_type');
    table.integer('price');
    table.integer('calc_price_per_sqm');
    table.float('lat');
    table.float('lng');
    table.string('location_classificator');
    table.integer('rooms');
    table.integer('area');
    table.string('area_measurement');
    table.integer('floor');
    table.text('content');
    table.json('images');
    table.integer('image_count');
    table.datetime('published_at').defaultTo(knex.fn.now());
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.string('foreign_id');
    table.integer('building_id');
    table.text('additional_data');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('properties');
};
