import { getApiKey } from './api-gateway';
import { logMetric } from './cloudwatch';
import { getRoles } from './permissions';

export class Customer {
  constructor(apiKey, roles = []) {
    this.apiKey = apiKey;
    this.roles = roles;
  }

  isAuthenticated() {
    return !!this.apiKey;
  }

  hasRole(role) {
    if (!this.isAuthenticated()) {
      return false;
    }
    return this.roles.includes(role);
  }
}

export default async function loadUser(apiKeyId) {
  if (!apiKeyId) {
    return new Customer();
  }

  const apiKey = await getApiKey(apiKeyId);

  if (!apiKey.customerId) {
    return new Customer();
  }

  logMetric('ApiKeyUsage', 1, [
    { Name: 'KeyId', Value: apiKeyId },
    { Name: 'CustomerId', Value: apiKey.customerId },
  ]);
  const customerRoles = getRoles(apiKey.customerId);

  return new Customer(apiKey, customerRoles);
}
