import AWS from 'aws-sdk';
import { getApiKey } from './api-gateway';

describe('api-gateway', () => {
  describe('getApiKey', () => {
    test('retrieves the API key', async () => {
      const mockApiKey = {
        apiKeyId: 'api-key-id',
      };
      jest
        .spyOn(AWS.APIGateway.services['2015-07-09'].prototype, 'getApiKey')
        .mockImplementation((request) => ({
          promise: jest.fn().mockReturnValue(mockApiKey),
        }));

      const output = await getApiKey('api-key-id');

      expect(output).toBe(mockApiKey);
    });
  });
});
