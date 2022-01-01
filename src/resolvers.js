/* istanbul ignore file */
import calculateBuildingId from './mutations/calculate-building-id';
import createPinger from './mutations/create-pinger';
import createProperty from './mutations/create-property';
import unsubscribePinger from './mutations/unsubscribe-pinger';
import bounds from './resolvers/bounds';
import building from './resolvers/buildings';
import point from './resolvers/point';
import properties from './resolvers/properties';
import Building from './resolvers/Building';
import Property from './resolvers/Property';
import PropertyPriceSummary from './resolvers/PropertyPriceSummary';
import PropertyWrapper from './resolvers/PropertyWrapper';

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
    unsubscribePinger,
  },

  Building,
  Property,
  PropertyWrapper,
  PropertyPriceSummary,
};
