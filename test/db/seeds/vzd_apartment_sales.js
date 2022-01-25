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
          sale_date: '2020-01-15T00:00:00Z',
        }),
        makeVZDApartmentSale({
          sale_id: 100,
          building_cadastral_designation: '42010053310001',
        }),
        makeVZDApartmentSale({
          building_cadastral_designation: '42010053310001',
          object_type: 'T',
          sale_date: '2020-01-15T00:00:00Z',
        }),
        makeVZDApartmentSale({
          building_cadastral_designation: '42010053310002',
        }),
        makeVZDApartmentSale({
          building_cadastral_designation: '42010053310003',
          object_type: 'T',
        }),
      ]);
    });
};
