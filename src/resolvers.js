/* istanbul ignore file */
import createPinger from './mutations/create-pinger';
import createProperty from './mutations/create-property';
import unsubscribePinger from './mutations/unsubscribe-pinger';
import properties from './resolvers/properties';
import PropertyPriceSummary from './resolvers/property-price-summary';

export default {
  Query: {
    properties,
  },
  Mutation: {
    createPinger,
    createProperty,
    unsubscribePinger,
  },

  PropertyPriceSummary,
};
