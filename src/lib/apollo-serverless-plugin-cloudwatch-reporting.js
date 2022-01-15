import { putMetricData } from './cloudwatch';

export default () => ({
  async requestDidStart() {
    return {
      async executionDidStart() {
        const fields = {
          resolvers: [],
          map: {},
        };

        return {
          willResolveField({ info }) {
            const start = process.hrtime.bigint();
            const resolver = `${info.parentType.name}.${info.fieldName}`;

            return (error) => {
              const end = process.hrtime.bigint();

              if (!fields.map[resolver]) {
                fields.map[resolver] = [];
                fields.resolvers.push(resolver);
              }
              fields.map[resolver].push(Number(end - start) / 1000);
            };
          },
          async executionDidEnd() {
            if (!fields.resolvers.length) return;

            await putMetricData({
              Namespace: 'Brokalys/GraphQL/Performance',
              MetricData: fields.resolvers.map((resolver) => ({
                MetricName: resolver,
                Unit: 'Microseconds',
                Values: fields.map[resolver],
                Dimensions: [{ Name: 'Stage', Value: process.env.STAGE }],
              })),
            });
          },
        };
      },
    };
  },
});
