import makeVZDHouseSale from '../fixtures/vzd-house-sale';

exports.seed = function (knex) {
  return knex('vzd_house_sales')
    .del()
    .then(function () {
      return knex('vzd_house_sales').insert([
        makeVZDHouseSale({
          building_cadastral_designation: '42010053310001',
        }),
        makeVZDHouseSale({
          sale_id: 100,
          building_cadastral_designation: '42010053310001',
        }),
        makeVZDHouseSale({
          sale_id: 100,
          building_cadastral_designation: '42010053310001',
        }),
        makeVZDHouseSale({
          building_cadastral_designation: '42010053310002',
          sale_date: null,
        }),
        makeVZDHouseSale({
          building_cadastral_designation: '42010053310003',
        }),
      ]);
    });
};
