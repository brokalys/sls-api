import Bugsnag from '@bugsnag/js';

const key = process.env.BUSNAG_KEY;

if (key && !process.env.CI) {
  Bugsnag.start(key);
}

export default Bugsnag;
