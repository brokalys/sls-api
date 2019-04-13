import Repository from '../lib/repository';
import unsubscribePinger from './unsubscribe-pinger';

jest.mock('../lib/repository', () => ({
  unsubscribePinger: jest.fn(),
}));

describe('unsubscribePinger', () => {
  it('attempts to unsubscribe a pinger', async () => {
    await unsubscribePinger(
      {},
      {
        id: 1,
        unsubscribe_key: 'test_123',
      },
    );

    expect(Repository.unsubscribePinger).toHaveBeenCalledTimes(1);
  });
});
