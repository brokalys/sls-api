import AWS from 'aws-sdk';
import { publish } from './sns';

describe('sns', () => {
  describe('publish', () => {
    test('publishes a SNS message', async () => {
      jest
        .spyOn(AWS.SNS.services['2010-03-31'].prototype, 'publish')
        .mockImplementation((request) => ({
          promise: jest.fn().mockReturnValue('invoked'),
        }));

      const output = await publish({
        Message: 'message',
        MessageGroupId: 'group-id',
        MessageStructure: 'string',
        TargetArn: 'arn:aws:sns:eu-west-1:123456789012:topic-name',
      });

      expect(output).toBe('invoked');
    });
  });
});
