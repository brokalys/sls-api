import getRegions from './get-regions';

async function getRegion(parent, args) {
  const name = args.name.toLowerCase();
  const data = await getRegions(parent, args);

  return data.find((row) => row.name.toLowerCase() === name);
}

export default getRegion;
