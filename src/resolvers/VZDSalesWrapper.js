function filterByObjectType(type) {
  return (results) => results.filter((row) => row.object_type === type);
}

export default {
  apartments: (building, input, { dataSources }) => {
    return dataSources.vzdApartmentSales
      .loadByBuildingId(building.id)
      .then(filterByObjectType('Dz'));
  },
  premises: (building, input, { dataSources }) => {
    return dataSources.vzdApartmentSales
      .loadByBuildingId(building.id)
      .then(filterByObjectType('T'));
  },
  houses: (building, input, { dataSources }) => {
    return dataSources.vzdHouseSales.loadByBuildingId(building.id);
  },
};
