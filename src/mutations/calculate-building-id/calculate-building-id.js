import normalizeAddress from '@brokalys/address-normalization';

async function calculateBuildingId(parent, input, context) {
  const { buildings, userClassifieds } = context.dataSources;

  const data = {
    ...input,
    images: JSON.stringify(input.images),
  };

  const addr = normalizeAddress(data);

  const [buildingId] = await Promise.all([
    // Attempt to locate the appropriate building
    buildings.findBuildingIdByAddress({
      ...addr,
      lat: data.lat,
      lng: data.lng,
      foreign_id: data.foreign_id,
    }),

    // Create a new entry in the DB
    userClassifieds.create(data),
  ]);

  return buildingId;
}

export default calculateBuildingId;
