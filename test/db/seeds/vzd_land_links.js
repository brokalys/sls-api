exports.seed = function (knex) {
  return knex('vzd_land_links')
    .del()
    .then(function () {
      return knex('vzd_land_links').insert([
        {
          cadastral_designation: '42010053310001',
          vzd_land_sale_id: 1,
          link_type: 'latlng',
        },
        {
          cadastral_designation: '42010053310002',
          vzd_land_sale_id: 1,
          link_type: 'latlng',
        },
        {
          cadastral_designation: '42010053310002',
          vzd_land_sale_id: 2,
          link_type: 'latlng',
        },
        {
          cadastral_designation: '96860060000',
          vzd_land_sale_id: 1,
          link_type: 'latlng',
        },
      ]);
    });
};
