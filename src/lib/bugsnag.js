import Bugsnag from '@bugsnag/js';

const apiKey = process.env.BUGSNAG_KEY;

if (apiKey) {
  Bugsnag.start({
    apiKey,
    logger: null,
  });
}

export default Bugsnag;
