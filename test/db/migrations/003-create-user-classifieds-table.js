exports.up = function (knex) {
  return knex.schema.createTable('user_classifieds', (table) => {
    table.increments('id');
    table.datetime('created_at').defaultTo(knex.fn.now());

    table.string('source');
    table.string('url');

    table.string('category');
    table.string('type');
    table.string('rent_type');

    table.float('lat');
    table.float('lng');

    table.integer('price');
    table.integer('calc_price_per_sqm');

    table.string('location_district');
    table.string('location_parish');
    table.string('location_address');
    table.string('location_village');

    table.integer('rooms');
    table.integer('area');
    table.string('area_measurement');
    table.integer('floor');
    table.integer('max_floors');

    table.text('content');
    table.string('building_project');
    table.string('building_material');
    table.text('images');

    table.string('foreign_id');
    table.text('additional_data');
    table.string('cadastre_number');

    table.integer('land_area');
    table.string('land_area_measurement');
    table.string('published_at');
    table.integer('views');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('user_classifieds');
};
