import Repository from 'lib/repository';
import confirmPinger from './confirm-pinger';

jest.mock('lib/repository');

describe('confirmPinger', () => {
  test('attempts to confirm a pinger', async () => {
    await confirmPinger(
      {},
      {
        id: 1,
        confirm_key: 'test_123',
      },
    );

    expect(Repository.confirmPinger).toHaveBeenCalledTimes(1);
  });
});
