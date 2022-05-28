import BuildingDataSource from 'data-sources/buildings';
import LandDataSource from 'data-sources/land';
import UserClassifiedsDataSource from 'data-sources/user-classifieds';
import calculateEstateId from './calculate-estate-id';

jest.mock('data-sources/buildings');
jest.mock('data-sources/land');
jest.mock('data-sources/user-classifieds');

const mockInput = {
  source: 'ss.lv',
  url: 'https://example.com',

  category: 'apartment',
  type: 'sell',
  rent_type: undefined,

  lat: 56.95,
  lng: 24.0737,

  price: 10000,
  price_per_sqm: 100,

  location_district: 'Rīga',
  location_parish: 'Imanta',
  location_address: 'Zentenes 18',
  location_village: undefined,

  rooms: 2,
  area: 100,
  area_measurement: 'm2',
  floor: 1,
  max_floors: 2,

  content: 'Hello World!',
  building_project: 'Hrušč',
  building_material: 'Ķieģelu',
  images: ['https://cat.image/cat.png'],

  foreign_id: 'id_123',
  additional_data: '{"views": 123}',
  cadastre_number: '123123',

  land_area: 100,
  land_area_measurement: 'm2',
  published_at: '2022-01-01 14:30:00',
  views: 12,
};

describe('calculateEstateId', () => {
  let dataSources;

  beforeEach(() => {
    dataSources = {
      buildings: BuildingDataSource,
      land: LandDataSource,
      userClassifieds: UserClassifiedsDataSource,
    };
  });

  afterEach(jest.clearAllMocks);

  test.each([
    mockInput,
    { ...mockInput, additional_data: 'bogus' },
    { ...mockInput, images: 'bogus' },
    { price: 123 },
  ])(
    'successfully creates a new user classified with input: %j',
    async (input) => {
      await calculateEstateId({}, input, {
        dataSources,
      });

      expect(dataSources.userClassifieds.create).toHaveBeenCalledTimes(1);
    },
  );

  test('returns the located building', async () => {
    dataSources.buildings.findBuildingIdByAddress.mockReturnValue(123);

    const output = await calculateEstateId({}, mockInput, {
      dataSources,
    });

    expect(output).toEqual({ id: 123, type: 'building' });
  });

  test('returns the located land plot', async () => {
    dataSources.land.findIdByAddress.mockReturnValue(333);

    const output = await calculateEstateId(
      {},
      { ...mockInput, category: 'land' },
      {
        dataSources,
      },
    );

    expect(output).toEqual({ id: 333, type: 'land' });
  });
});
