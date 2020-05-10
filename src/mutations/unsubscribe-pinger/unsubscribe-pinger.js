import Repository from 'lib/repository';

async function unsubscribePinger(parent, input) {
  if (input.all) {
    await Repository.unsubscribeAllPingers(input.id, input.unsubscribe_key);
    return true;
  }

  await Repository.unsubscribePinger(input.id, input.unsubscribe_key);
  return true;
}

export default unsubscribePinger;
