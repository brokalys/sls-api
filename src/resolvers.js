import confirmPinger from './mutations/confirm-pinger';
import createPinger from './mutations/create-pinger';
import createProperty from './mutations/create-property';
import unsubscribePinger from './mutations/unsubscribe-pinger';
import properties from './resolvers/properties';
import propertyExists from './resolvers/property-exists';

export const resolvers = {
  Query: {
    properties,
    propertyExists,
  },
  Mutation: {
    confirmPinger,
    createPinger,
    createProperty,
    unsubscribePinger,
  },
};
