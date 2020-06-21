import AWS from 'aws-sdk';

const sqs = new AWS.SQS({
  region: process.env.AWS_REGION,
});

export function sendMessage(message) {
  return sqs.sendMessage(message).promise();
}
