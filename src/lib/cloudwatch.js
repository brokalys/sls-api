import AWS from 'aws-sdk';

const cloudwatch = new AWS.CloudWatch({ apiVersion: '2010-08-01' });

export function putMetricData(data) {
  return cloudwatch.putMetricData(data).promise();
}

export function logMetric(name, value, dimensions = []) {
  return putMetricData({
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
  });
}
