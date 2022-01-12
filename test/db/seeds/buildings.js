exports.seed = function (knex) {
  return knex('vzd_buildings')
    .del()
    .then(function () {
      return knex('vzd_buildings').insert([
        {
          id: 1,
          bounds: JSON.stringify([
            [
              { x: 56.992294, y: 24.136619 },
              { x: 56.976394, y: 23.99579 },
              { x: 56.992294, y: 24.136619 },
            ],
          ]),
          city: 'riga',
          street: 'brivibas',
          house_number: '12',
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
          city: 'riga',
          street: 'brivibas',
          house_number: '13',
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
          city: 'riga',
          street: 'brivibas',
          house_number: '13',
        },
      ]);
    });
};
