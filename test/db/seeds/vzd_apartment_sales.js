import makeVZDApartmentSale from '../fixtures/vzd-apartment-sale';

exports.seed = function (knex) {
  return knex('vzd_apartment_sales')
    .del()
    .then(function () {
      return knex('vzd_apartment_sales').insert([
        makeVZDApartmentSale({
          building_cadastral_designation: '42010053310001',
        }),
        makeVZDApartmentSale({
          sale_id: 100,
          building_cadastral_designation: '42010053310001',
        }),
        makeVZDApartmentSale({
          sale_id: 100,
          building_cadastral_designation: '42010053310001',
        }),
        makeVZDApartmentSale({
          building_cadastral_designation: '42010053310002',
        }),
        makeVZDApartmentSale({
          building_cadastral_designation: '42010053310003',
        }),
      ]);
    });
};
