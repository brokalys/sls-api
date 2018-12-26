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
      },
      {
        price: 170000.0,
        lat: 56.9366684,
        lng: 24.0794235,
      },
    ];

    if (sql.indexOf('category') === -1) {
      data.push({
        price: 70000.0,
        lat: 56.9366684,
        lng: 24.0794235,
      });
    }

    return data;
  },

  end() {},
});
