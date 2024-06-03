import graphqlFields from 'graphql-fields';

function normalizeFields(info) {
  const fieldMap = {
    id: 'id_hash',
    email: 'email',
    category: 'categories',
    type: 'types',
    price_min: 'price_min',
    price_max: 'price_max',
    price_type: 'price_type',
    region: 'location',
    rooms_min: 'rooms_min',
    rooms_max: 'rooms_max',
    area_m2_min: 'area_m2_min',
    area_m2_max: 'area_m2_max',
    frequency: 'frequency',
    comments: 'comments',
    marketing: 'marketing',
    created_at: 'created_at',
    unsubscribed_at: 'unsubscribed_at',
    unsubscribe_key: 'unsubscribe_key',
  };
  const fields = Object.keys(graphqlFields(info));

  return fields
    .map((key) => fieldMap[key])
    .flat()
    .filter((field) => !!field);
}

export default {
  results(ids, input, { dataSources }, info) {
    return dataSources.pingers.loadMany(ids, normalizeFields(info));
  },
};
