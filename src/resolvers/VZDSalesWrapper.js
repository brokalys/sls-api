export default {
  apartments: (building, input, { dataSources }) => {
    return dataSources.vzdApartmentSales.loadByBuildingId(building.id);
  },
};
