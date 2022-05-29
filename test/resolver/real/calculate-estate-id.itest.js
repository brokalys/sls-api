import { createTestClient } from 'apollo-server-testing';
import { server } from 'handler';
import db from 'db-config';

const mockInput = {
  foreign_id: 'id999',
  source: 'ss.lv',
  type: 'sell',
  category: 'apartment',
  url: 'https://example.com',
  price: 10000,
  lat: 56.992294,
  lng: 24.136619,
  cadastre_number: '01000280009',
  images: [],
};

const { mutate } = createTestClient(server);

const MUTATION = `
mutation ChromeExtension_CalculateEstateId(
    $source: String
    $url: String
    $category: String
    $type: String
    $rent_type: String
    $lat: Float
    $lng: Float
    $price: Float
    $price_per_sqm: Float
    $location_district: String
    $location_parish: String
    $location_address: String
    $location_village: String
    $rooms: Int
    $area: Int
    $area_measurement: String
    $floor: Int
    $max_floors: Int
    $content: String
    $building_project: String
    $building_material: String
    $images: [String]!
    $foreign_id: String
    $additional_data: String
    $cadastre_number: String
    $land_area: Float
    $land_area_measurement: String
    $published_at: String
    $views: Int
  ) {
    calculateEstateId(
      source: $source
      url: $url

      category: $category
      type: $type
      rent_type: $rent_type

      lat: $lat
      lng: $lng

      price: $price
      price_per_sqm: $price_per_sqm

      location_district: $location_district
      location_parish: $location_parish
      location_address: $location_address
      location_village: $location_village

      rooms: $rooms
      area: $area
      area_measurement: $area_measurement
      floor: $floor
      max_floors: $max_floors

      content: $content
      building_project: $building_project
      building_material: $building_material
      images: $images

      foreign_id: $foreign_id
      additional_data: $additional_data
      cadastre_number: $cadastre_number

      land_area: $land_area
      land_area_measurement: $land_area_measurement
      published_at: $published_at
      views: $views
    ) {
      id
      type
    }
  }
`;

describe('Mutation: calculateEstateId', () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  test('successfully calculates the estate-id from foreign_id', async () => {
    const response = await mutate({
      mutation: MUTATION,
      variables: {
        ...mockInput,
      },
    });

    expect(response).toMatchSnapshot();
  });

  test('returns null if could not calculate for the property', async () => {
    const response = await mutate({
      mutation: MUTATION,
      variables: {
        ...mockInput,
        foreign_id: null,
      },
    });

    expect(response).toMatchSnapshot();
  });
});
