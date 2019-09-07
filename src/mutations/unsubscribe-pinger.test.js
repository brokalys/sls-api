import Repository from '../lib/repository';
import unsubscribePinger from './unsubscribe-pinger';

jest.mock('../lib/repository');

describe('unsubscribePinger', () => {
  test('attempts to unsubscribe a pinger', async () => {
    await unsubscribePinger(
      {},
      {
        id: 1,
        unsubscribe_key: 'test_123',
      },
    );

    expect(Repository.unsubscribePinger).toHaveBeenCalledTimes(1);
  });

  test('attempts to unsubscribe all pingers', async () => {
    await unsubscribePinger(
      {},
      {
        id: 1,
        unsubscribe_key: 'test_123',
        all: true,
      },
    );

    expect(Repository.unsubscribeAllPingers).toHaveBeenCalledTimes(1);
  });
});
