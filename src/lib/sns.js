import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const client = new SNSClient({ region: process.env.AWS_REGION });

export function publish(message) {
  return client.send(new PublishCommand(message));
}
