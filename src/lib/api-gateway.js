import AWS from 'aws-sdk';

const apiGateway = new AWS.APIGateway({
  apiVersion: '2015-07-09',
});

const keyCache = new Map();

export async function getApiKey(id) {
  if (keyCache.has(id)) {
    return keyCache.get(id);
  }

  const data = await apiGateway
    .getApiKey({
      apiKey: id,
      includeValue: false,
    })
    .promise();

  keyCache.set(id, data);
  return data;
}
