import normalizeAddress from '@brokalys/address-normalization';

async function calculateBuildingId(parent, input, context) {
  const { buildings, userClassifieds } = context.dataSources;

  const data = {
    ...input,
    images: JSON.stringify(input.images),
    building_material: input.building_material?.trim(),
    building_project: input.building_project?.trim(),
    location_address: input.location_address?.trim(),
    location_district: input.location_district?.trim(),
    location_parish: input.location_parish?.trim(),
    cadastre_number: input.cadastre_number?.trim(),
  };

  const addr = normalizeAddress(data);

  const [buildingId] = await Promise.all([
    // Attempt to locate the appropriate building
    buildings.findBuildingIdByAddress({
      ...data,
      ...addr,
    }),

    // Create a new entry in the DB
    userClassifieds.create(data),
  ]);

  return buildingId;
}

export default calculateBuildingId;
