import { getApiKey } from './api-gateway';
import { putMetricData } from './cloudwatch';
import { getRoles } from './permissions';

export default async function loadUser(apiKeyId) {
  if (!apiKeyId) {
    return null;
  }

  const apiKey = await getApiKey(apiKeyId);

  if (!apiKey.customerId) {
    return null;
  }

  await putMetricData('ApiKeyUsage', 1, [
    { Name: 'KeyId', Value: apiKeyId },
    { Name: 'CustomerId', Value: apiKey.customerId },
  ]);
  const customerRoles = getRoles(apiKey.customerId);

  return {
    apiKey,
    hasRole: (role) => {
      return customerRoles.includes(role);
    },
  };
}
