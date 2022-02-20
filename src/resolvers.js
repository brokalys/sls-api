/* istanbul ignore file */
import calculateBuildingId from './mutations/calculate-building-id';
import createPinger from './mutations/create-pinger';
import createProperty from './mutations/create-property';
import submitFeedback from './mutations/submit-feedback';
import unsubscribePinger from './mutations/unsubscribe-pinger';
import bounds from './resolvers/query/bounds';
import building from './resolvers/query/building';
import properties from './resolvers/query/properties';
import vzd from './resolvers/query/vzd';
import Building from './resolvers/Building';
import Property from './resolvers/Property';
import PropertyPriceSummary from './resolvers/PropertyPriceSummary';
import PropertyWrapper from './resolvers/PropertyWrapper';
import VZDApartmentSale from './resolvers/VZDApartmentSale';
import VZDHouseSale from './resolvers/VZDHouseSale';
import VZDPremiseSale from './resolvers/VZDPremiseSale';
import VZDSalesWrapper from './resolvers/VZDSalesWrapper';

export default {
  Query: {
    bounds,
    building,
    properties,
    vzd,
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
  VZDHouseSale,
  VZDPremiseSale,
  VZDSalesWrapper,
};
