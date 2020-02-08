import Repository from '../lib/repository';

async function confirmPinger(parent, input) {
  await Repository.confirmPinger(input.id, input.confirm_key);
  return true;
}

export default confirmPinger;
