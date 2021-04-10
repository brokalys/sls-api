import AWS from 'aws-sdk';

const cloudwatch = new AWS.CloudWatch({ apiVersion: '2010-08-01' });

export function putMetricData(name, value, dimensions = []) {
  return cloudwatch
    .putMetricData({
      Namespace: 'Brokalys',
      MetricData: [
        {
          MetricName: name,
          Unit: 'Count',
          Value: value,
          Dimensions: [
            { Name: 'Stage', Value: process.env.STAGE },
            ...dimensions,
          ],
        },
      ],
    })
    .promise();
}
