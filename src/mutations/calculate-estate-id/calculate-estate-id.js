import normalizeAddress from '@brokalys/address-normalization';

async function calculateEstateId(parent, input, context) {
  const { buildings, land, userClassifieds } = context.dataSources;

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
