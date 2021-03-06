import Repository from 'lib/repository';
import unsubscribePinger from './unsubscribe-pinger';

jest.mock('lib/repository');

describe('unsubscribePinger', () => {
  test('attempts to unsubscribe a pinger', async () => {
    await unsubscribePinger(
      {},
      {
        id: '1',
        unsubscribe_key: 'test_123',
      },
    );

    expect(Repository.unsubscribePinger).toHaveBeenCalledTimes(1);
  });

  test('attempts to unsubscribe a pinger with id hash', async () => {
    await unsubscribePinger(
      {},
      {
        id: 'c8bf6d2c-7eba-11eb-b2a8-663c33f40218',
        unsubscribe_key: 'test_123',
      },
    );

    expect(Repository.unsubscribePinger).toHaveBeenCalledTimes(1);
  });

  test('attempts to unsubscribe all pingers', async () => {
    await unsubscribePinger(
      {},
      {
        id: '1',
        unsubscribe_key: 'test_123',
        all: true,
      },
    );

    expect(Repository.unsubscribeAllPingers).toHaveBeenCalledTimes(1);
  });
});
