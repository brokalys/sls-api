import Bugsnag from '@bugsnag/js';

jest.mock('@bugsnag/js');

describe('bugsnag', () => {
  beforeEach(() => {
    delete process.env.BUGSNAG_KEY;
  });

  test('starts the client if key is present', () => {
    process.env.BUGSNAG_KEY = 'key';

    require('./bugsnag');

    expect(Bugsnag.start).toBeCalled();
  });

  test('does not initialize if key is not present', () => {
    require('./bugsnag');

    expect(Bugsnag.start).not.toBeCalled();
  });
});
