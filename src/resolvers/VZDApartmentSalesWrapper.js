export default {
  results(ids, input, { dataSources }) {
    return dataSources.vzdApartmentSales.loadMany(ids);
  },
};
