exports.seed = function (knex) {
  return knex('property_building_links')
    .del()
    .then(function () {
      return knex('property_building_links').insert([
        {
          property_id: 1,
          vzd_building_id: 1,
          link_type: 'latlng',
        },
        {
          property_id: 2,
          vzd_building_id: 1,
          link_type: 'latlng',
        },
        {
          property_id: 3,
          vzd_building_id: 2,
          link_type: 'latlng',
        },
        {
          property_id: 4,
          vzd_building_id: 4,
          link_type: 'latlng',
        },
        {
          property_id: 5,
          vzd_building_id: 4,
          link_type: 'latlng',
        },
        {
          property_id: 6,
          vzd_building_id: 4,
          link_type: 'latlng',
        },
        {
          property_id: 7,
          vzd_building_id: 5,
          link_type: 'latlng',
        },
        {
          property_id: 8,
          vzd_building_id: 5,
          link_type: 'latlng',
        },
        {
          property_id: 9,
          vzd_building_id: 5,
          link_type: 'latlng',
        },
        {
          property_id: 10,
          vzd_building_id: 5,
          link_type: 'latlng',
        },
      ]);
    });
};
