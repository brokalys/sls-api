import AWS from 'aws-sdk';

AWS.config.update({ region: process.env.AWS_REGION });

const sns = new AWS.SNS({
  apiVersion: '2012-11-05',
});

export function publish(message) {
  return sns.publish(message).promise();
}
