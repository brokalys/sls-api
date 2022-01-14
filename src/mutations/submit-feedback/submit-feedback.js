import Bugsnag from 'lib/bugsnag';

async function submitFeedback(parent, input) {
  Bugsnag.addMetadata('input', input);
  await Bugsnag.notify(new Error('New feedback submission'));

  return true;
}

export default submitFeedback;
