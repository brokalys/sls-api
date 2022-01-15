export default {
  apartments: (building, input, { dataSources }) => {
    return dataSources.vzdApartmentSales
      .loadByBuildingId(building.id)
      .then((results) => results.map(({ id }) => id));
  },
};
