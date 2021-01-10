import Bugsnag from '@bugsnag/js';

const key = process.env.BUGSNAG_KEY;

if (key) {
  Bugsnag.start(key);
}

export default Bugsnag;
