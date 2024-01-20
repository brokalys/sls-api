import {
  CloudWatchClient,
  PutMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';

const client = new CloudWatchClient();

export function putMetricData(data) {
  const command = new PutMetricDataCommand(data);
  return client.send(command);
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
