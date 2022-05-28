import normalizeAddress from '@brokalys/address-normalization';

async function calculateEstateId(parent, input, context) {
  const { buildings, land, userClassifieds } = context.dataSources;

  const data = {
    ...input,
    images: JSON.stringify(input.images),
  };

  const isLandType = data.category === 'land';

  const addr = normalizeAddress(data);

  const [estateId] = await Promise.all([
    // Attempt to locate the appropriate estate
    isLandType
      ? land.findIdByAddress({
          ...data,
          ...addr,
        })
      : buildings.findBuildingIdByAddress({
          ...data,
          ...addr,
        }),

    // Create a new entry in the DB
    userClassifieds.create(data),
  ]);

  return {
    id: estateId,
    type: isLandType ? 'land' : 'building',
  };
}

export default calculateEstateId;
