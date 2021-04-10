export default function makeProperty(customData = {}) {
  return {
    source: 'ss.lv',
    url:
      'https://www.ss.com/msg/lv/real-estate/flats/aizkraukle-and-reg/aiviekstes-pag/aghfx.html',
    category: 'apartment',
    type: 'rent',
    rent_type: 'monthly',
    price: 100,
    lat: 56.1,
    lng: 24.9,
    location_classificator: 'latvia-riga-agenskalns',
    area: 90,
    floor: 2,
    calc_price_per_sqm: 1.11,
    building_id: 1,
    created_at: '2021-01-02T00:00:00.000Z',
    published_at: '2021-04-12T19:47:30.000Z',
    ...customData,
  };
}
