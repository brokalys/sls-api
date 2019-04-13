import Repository from '../lib/repository';

async function unsubscribePinger(parent, input) {
  await Repository.unsubscribePinger(input.id, input.unsubscribe_key);
  return true;
}

export default unsubscribePinger;
