import { UserInputError } from 'apollo-server-lambda';

import db from 'lib/db';
import propertyExists from './property-exists';

jest.mock('lib/db');

db.query.mockReturnValue([{ price: 1 }, { price: 2 }, { price: 3 }]);

describe('propertyExists', () => {
  test('returns `true` if at least one property was found', async () => {
    const output = await propertyExists(
      {},
      {
        source: 'brokalys.com',
        foreign_id: '123',
      },
    );

    expect(output).toBeTruthy();
  });

  test('returns `false` if no properties are found', async () => {
    db.query.mockReturnValue([]);

    const output = await propertyExists(
      {},
      {
        source: 'brokalys.com',
        foreign_id: '123',
      },
    );

    expect(output).toBeFalsy();
  });

  test.each([
    // Source
    ['quote"brokalys.com', '123'],
    [123, '123'],
    [true, '123'],
    [false, '123'],
    ['', '123'],
    [null, '123'],
    [undefined, '123'],

    // Foreign id
    ['brokalys.com', '123"123'],
    ['brokalys.com', 123],
    ['brokalys.com', null],
    ['brokalys.com', true],
    ['brokalys.com', false],
    ['brokalys.com', ''],
    ['brokalys.com', undefined],
  ])(
    'throws a validation error if input is malformed with: %s && %s',
    (source, foreign_id) => {
      expect(() => {
        propertyExists(
          {},
          {
            source,
            foreign_id,
          },
        );
      }).toThrow(UserInputError);
    },
  );

  test('throws a validation error if input has unknown fields', () => {
    expect(() => {
      propertyExists(
        {},
        {
          source: 'brokalys.com',
          foreign_id: '123',
          unkown: 'field',
        },
      );
    }).toThrow(UserInputError);
  });
});
