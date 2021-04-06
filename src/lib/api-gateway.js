import AWS from 'aws-sdk';

const apiGateway = new AWS.APIGateway({
  apiVersion: '2015-07-09',
});

export function getApiKey(id) {
  return apiGateway
    .getApiKey({
      apiKey: id,
      includeValue: false,
    })
    .promise();
}
