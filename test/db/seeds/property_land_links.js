exports.seed = function (knex) {
  return knex('property_land_links')
    .del()
    .then(function () {
      return knex('property_land_links').insert([
        {
          property_id: 2,
          vzd_land_id: 1,
          link_type: 'latlng',
        },
        {
          property_id: 1,
          vzd_land_id: 1,
          link_type: 'cadnum',
        },
        {
          property_id: 2,
          vzd_land_id: 1,
          link_type: 'latlng',
        },
      ]);
    });
};
