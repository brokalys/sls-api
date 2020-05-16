import confirmPinger from './mutations/confirm-pinger';
import createPinger from './mutations/create-pinger';
import createProperty from './mutations/create-property';
import unsubscribePinger from './mutations/unsubscribe-pinger';
import properties from './resolvers/properties';

export default {
  Query: {
    properties,
  },
  Mutation: {
    confirmPinger,
    createPinger,
    createProperty,
    unsubscribePinger,
  },
};
