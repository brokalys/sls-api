exports.seed = function (knex) {
  return knex('vzd_land')
    .del()
    .then(function () {
      return knex('vzd_land').insert([
        {
          id: 1,
          bounds: JSON.stringify([
            [
              { x: 56.992294, y: 24.136619 },
              { x: 56.976394, y: 23.99579 },
              { x: 56.992294, y: 24.136619 },
            ],
          ]),
          cadastral_designation: '42010053310001',
          object_code: '5201011310',
          area: 100,
          group_code: '9894006',
          location_classificator: 'latvia-riga-centrs',
          is_usable: true,
        },
        {
          id: 2,
          bounds: JSON.stringify([
            [
              { x: 56.992294, y: 24.136619 },
              { x: 56.976394, y: 23.99579 },
              { x: 56.992294, y: 24.136619 },
            ],
          ]),
          cadastral_designation: '42010053310002',
          object_code: '5201011310',
          area: 100,
          group_code: '9894006',
          location_classificator: 'latvia-riga-centrs',
          is_usable: true,
        },
        {
          id: 3,
          bounds: JSON.stringify([
            [
              { x: 56.992294, y: 24.136619 },
              { x: 56.976394, y: 23.99579 },
              { x: 56.992294, y: 24.136619 },
            ],
          ]),
          cadastral_designation: '42010053310003',
          object_code: '5201011310',
          area: 100,
          group_code: '9894006',
          location_classificator: 'latvia-riga-agenskalns',
          is_usable: true,
        },
        {
          id: 4,
          bounds: JSON.stringify([
            [
              { x: 56, y: 24 },
              { x: 56.1, y: 23.1 },
              { x: 56.1, y: 24.1 },
            ],
          ]),
          cadastral_designation: '42010053310004',
          object_code: '5201011310',
          area: 100,
          group_code: '9894006',
          location_classificator: 'latvia-riga',
          is_usable: true,
        },
      ]);
    });
};
