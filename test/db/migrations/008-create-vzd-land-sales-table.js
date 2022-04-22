exports.up = function (knex) {
  return knex.schema.createTable('vzd_land_sales', (table) => {
    table.increments('id');
    table.integer('sale_id');
    table.string('cadastre_number');
    table.string('property_name');
    table.string('property_address');
    table.string('property_county');
    table.string('property_city');
    table.string('property_parish');
    table.string('sale_date');
    table.integer('price');
    table.integer('land_built_up');
    table.integer('land_count');
    table.string('land_cadastral_designations');
    table.float('land_part_counter');
    table.float('land_part_denominator');
    table.float('land_total_area_m2');
    table.float('agricultural_land_area_m2');
    table.float('arable_land_area_m2');
    table.float('orchard_land_area_m2');
    table.float('meadow_land_area_m2');
    table.float('pasture_land_area_m2');
    table.float('ameliorated_land_area_m2');
    table.float('forest_land_area_m2');
    table.float('shrubbery_land_area_m2');
    table.float('swamp_land_area_m2');
    table.float('under_water_land_area_m2');
    table.float('under_pond_land_area_m2');
    table.float('under_buildings_land_area_m2');
    table.float('under_roads_land_area_m2');
    table.float('other_land_area_m2');
    table.datetime('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('vzd_land_sales');
};
