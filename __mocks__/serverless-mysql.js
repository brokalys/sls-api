export default () => ({
  connect() {},
  getClient() {
    return {
      escape() {},
    };
  },

  query({ sql }) {
    const data = [
      {
        price: 110000.0,
        lat: 56.9366684,
        lng: 24.0794235,
        price_per_sqm: 100,
        area: 120,
        area_measurement: 'm2',
      },
      {
        price: 170000.0,
        lat: 56.9366684,
        lng: 24.0794235,
        price_per_sqm: 0,
        area: 1,
        area_measurement: 'ha',
      },
    ];

    if (sql.indexOf('category') === -1) {
      data.push({
        price: 70000.0,
        lat: 56.9366684,
        lng: 24.0794235,
        price_per_sqm: 0,
        area: 120,
        area_measurement: 'm2',
      });
    }

    return data;
  },

  end() {},
});
