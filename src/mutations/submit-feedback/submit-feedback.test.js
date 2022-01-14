import Bugsnag from 'lib/bugsnag';
import submitFeedback from './submit-feedback';

jest.mock('lib/bugsnag');

const mockInput = {
  type: 'bug-report',
  message: 'Hello World!',
  email: 'demo@example.com',
};

describe('submitFeedback', () => {
  test('successfully submits the data to Bugsnag', async () => {
    const output = await submitFeedback({}, mockInput);

    expect(output).toBeTruthy();
    expect(Bugsnag.notify).toHaveBeenCalled();
  });
});
