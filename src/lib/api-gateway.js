import {
  APIGatewayClient,
  GetApiKeyCommand,
} from '@aws-sdk/client-api-gateway';

const client = new APIGatewayClient();

const keyCache = new Map();

export async function getApiKey(id) {
  if (keyCache.has(id)) {
    return keyCache.get(id);
  }

  const command = new GetApiKeyCommand({
    apiKey: id,
    includeValue: false,
  });
  const data = await client.send(command);

  keyCache.set(id, data);
  return data;
}
