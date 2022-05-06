import Bugsnag from '@bugsnag/js';
import BugsnagPluginAwsLambda from '@bugsnag/plugin-aws-lambda';

const apiKey = process.env.BUGSNAG_KEY;

const busgnagLogger = {
  debug: function () {},
  info: console.info,
  warn: console.warn,
  error: console.error,
};

if (apiKey) {
  Bugsnag.start({
    apiKey,
    logger: busgnagLogger,
    releaseStage: process.env.STAGE,
    plugins: [BugsnagPluginAwsLambda],
  });
}

export default Bugsnag;
