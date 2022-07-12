import makeVZDLandSale from '../fixtures/vzd-land-sale';

exports.seed = function (knex) {
  return knex('vzd_land_sales')
    .del()
    .then(function () {
      return knex('vzd_land_sales').insert([
        makeVZDLandSale(),
        makeVZDLandSale({
          sale_id: 100,
          price: 100,
          sale_date: null,
        }),
        makeVZDLandSale({
          price: 200,
        }),
      ]);
    });
};
