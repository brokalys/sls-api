import { getApiKey } from './api-gateway';
import loadUser from './auth';
import { PERMISSION_READ_PROPERTY_DATA } from './permissions';

jest.mock('./api-gateway');
jest.mock('./cloudwatch');

describe('auth', () => {
  test('does not load a user if no API key provided', async () => {
    const user = await loadUser(null);

    expect(user.isAuthenticated()).toBeFalsy();
    expect(user.hasRole('what-is-this')).toBeFalsy();
    expect(getApiKey).not.toBeCalled();
  });

  test('attempts to load the user if an api key is provided', async () => {
    getApiKey.mockReturnValue({});

    const user = await loadUser('wrong-api-key');

    expect(user.isAuthenticated()).toBeFalsy();
    expect(user.hasRole('what-is-this')).toBeFalsy();
  });

  test('successfully loads a user', async () => {
    getApiKey.mockReturnValue({
      customerId: 'mapApp',
    });

    const user = await loadUser('correct-api-key');

    expect(user.isAuthenticated()).toBeTruthy();
    expect(user.hasRole('what-is-this')).toBeFalsy();
    expect(user.hasRole(PERMISSION_READ_PROPERTY_DATA)).toBeTruthy();
  });
});
