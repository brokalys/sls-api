/* istanbul ignore file */
import calculateBuildingId from './mutations/calculate-building-id';
import createPinger from './mutations/create-pinger';
import createProperty from './mutations/create-property';
import submitFeedback from './mutations/submit-feedback';
import unsubscribePinger from './mutations/unsubscribe-pinger';
import bounds from './resolvers/bounds';
import building from './resolvers/buildings';
import point from './resolvers/point';
import properties from './resolvers/properties';
import Building from './resolvers/Building';
import Property from './resolvers/Property';
import PropertyPriceSummary from './resolvers/PropertyPriceSummary';
import PropertyWrapper from './resolvers/PropertyWrapper';
import VZDApartmentSale from './resolvers/VZDApartmentSale';
import VZDApartmentSalesWrapper from './resolvers/VZDApartmentSalesWrapper';
import VZDSalesWrapper from './resolvers/VZDSalesWrapper';

export default {
  Query: {
    bounds,
    building,
    point,
    properties,
  },
  Mutation: {
    calculateBuildingId,
    createPinger,
    createProperty,
    submitFeedback,
    unsubscribePinger,
  },

  Building,
  Property,
  PropertyWrapper,
  PropertyPriceSummary,

  VZDApartmentSale,
  VZDApartmentSalesWrapper,
  VZDSalesWrapper,
};
