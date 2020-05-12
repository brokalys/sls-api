import { UserInputError } from 'apollo-server-lambda';

import db from 'lib/db';
import propertyExists from './property-exists';

jest.mock('lib/bugsnag');
jest.mock('lib/db');

describe('propertyExists', () => {
  test.each([
    ['brokalys.com', undefined, undefined, undefined],
    ['brokalys.com', '123', undefined, undefined],
    ['brokalys.com', undefined, 'https://brokalys.com/test', undefined],
    ['brokalys.com', undefined, undefined, 2019],
    ['brokalys.com', undefined, undefined, '2019-01'],
    ['brokalys.com', undefined, undefined, '2019-01-01 00:00:00'],
    ['brokalys.com', undefined, undefined, '2019-01-01T00:00:00'],
    ['brokalys.com', undefined, undefined, '2019-01-01T00:00:00Z'],
    ['brokalys.com', '123', 'https://brokalys.com/test', '2019-01-01T00:00:00'],
  ])(
    'works with input parameters: %s, %s, %s, %s',
    async (source, foreign_id, url, created_at) => {
      db.query.mockReturnValue([{ price: 1 }]);

      const output = await propertyExists(
        {},
        {
          source,
          url,
          foreign_id,
          created_at,
        },
      );

      expect(output).toBeTruthy();
    },
  );

  test('returns `false` if no properties are found', async () => {
    db.query.mockReturnValue([]);

    const output = await propertyExists(
      {},
      {
        source: 'brokalys.com',
      },
    );

    expect(output).toBeFalsy();
  });

  test.each([
    // Source
    [
      'quote"brokalys.com',
      '123',
      'https://brokalys.com',
      '2019-01-01T00:00:00',
    ],
    [123, '123', 'https://brokalys.com', '2019-01-01T00:00:00'],
    [true, '123', 'https://brokalys.com', '2019-01-01T00:00:00'],
    [false, '123', 'https://brokalys.com', '2019-01-01T00:00:00'],
    ['', '123', 'https://brokalys.com', '2019-01-01T00:00:00'],
    [null, '123', 'https://brokalys.com', '2019-01-01T00:00:00'],
    [undefined, '123', 'https://brokalys.com', '2019-01-01T00:00:00'],

    // Foreign id
    ['brokalys.com', '123"123', 'https://brokalys.com', '2019-01-01T00:00:00'],
    ['brokalys.com', 123, 'https://brokalys.com', '2019-01-01T00:00:00'],
    ['brokalys.com', null, 'https://brokalys.com', '2019-01-01T00:00:00'],
    ['brokalys.com', true, 'https://brokalys.com', '2019-01-01T00:00:00'],
    ['brokalys.com', false, 'https://brokalys.com', '2019-01-01T00:00:00'],
    ['brokalys.com', '', 'https://brokalys.com', '2019-01-01T00:00:00'],

    // URL
    ['brokalys.com', '123', 'brokalys.com', '2019-01-01T00:00:00'],
    ['brokalys.com', '123', 123, '2019-01-01T00:00:00'],
    ['brokalys.com', '123', null, '2019-01-01T00:00:00'],
    ['brokalys.com', '123', false, '2019-01-01T00:00:00'],
    ['brokalys.com', '123', true, '2019-01-01T00:00:00'],
    ['brokalys.com', '123', '', '2019-01-01T00:00:00'],

    // Start date
    ['brokalys.com', '123', 'https://brokalys.com', '2019-01-01T00'],
    ['brokalys.com', '123', 'https://brokalys.com', 12],
    ['brokalys.com', '123', 'https://brokalys.com', false],
    ['brokalys.com', '123', 'https://brokalys.com', true],
    ['brokalys.com', '123', 'https://brokalys.com', null],
    ['brokalys.com', '123', 'https://brokalys.com', '2019-01-01T00:00:000'],
  ])(
    'throws a validation error if input is malformed with: %s, %s, %s, %s',
    (source, foreign_id, url, created_at) => {
      expect(() =>
        propertyExists(
          {},
          {
            source,
            url,
            foreign_id,
            created_at,
          },
        ),
      ).rejects.toBeInstanceOf(UserInputError);
    },
  );

  test('throws a validation error if input has unknown fields', () => {
    expect(() =>
      propertyExists(
        {},
        {
          source: 'brokalys.com',
          unkown: 'field',
        },
      ),
    ).rejects.toBeInstanceOf(UserInputError);
  });
});
