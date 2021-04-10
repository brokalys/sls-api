export const getApiKey = jest
  .fn()
  .mockImplementation((apiKeyId) => Promise.resolve({ customerId: apiKeyId }));
