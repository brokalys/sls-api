import AWS from 'aws-sdk';

AWS.config.update({ region: process.env.AWS_REGION });

const sqs = new AWS.SQS({
  apiVersion: '2012-11-05',
});

export function sendMessage(message) {
  console.log(message);
  return sqs.sendMessage(message).promise();
}
