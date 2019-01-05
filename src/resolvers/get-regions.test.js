import { UserInputError } from 'apollo-server-lambda';

import getRegions from './get-regions';

jest.mock('serverless-mysql');
jest.mock('../lib/cache');

describe('getRegions', () => {
  describe('validation', () => {
    test('end date must come after start date', async () => {
      try {
        await getRegions(
          {},
          {
            start_date: '2018-01-01',
            end_date: '2017-01-01',
          },
        );
      } catch (e) {
        expect(e).toEqual(
          new UserInputError('End date must come after start date'),
        );
      }
    });

    test('end date must not be greater than today', async () => {
      try {
        await getRegions(
          {},
          {
            start_date: '2018-01-01',
            end_date: '3000-01-01',
          },
        );
      } catch (e) {
        expect(e).toEqual(
          new UserInputError('End date must not be after today'),
        );
      }
    });

    test('start date cannot be prior to 2018-01-01', async () => {
      try {
        await getRegions(
          {},
          {
            start_date: '2017-12-01',
            end_date: '2018-01-01',
          },
        );
      } catch (e) {
        expect(e).toEqual(
          new UserInputError('Start date must be after `2018-01-01`'),
        );
      }
    });

    describe('difference between start and end date cannot be greater than a month', async () => {
      test('valid', async () => {
        const output = await getRegions(
          {},
          {
            start_date: '2018-01-01',
            end_date: '2018-02-01',
          },
        );

        expect(output).toBeDefined();
      });

      test('invalid', async () => {
        try {
          await getRegions(
            {},
            {
              start_date: '2018-01-01',
              end_date: '2018-02-02',
            },
          );
        } catch (e) {
          expect(e).toEqual(
            new UserInputError(
              'Difference between start and end date must not be bigger than 1 month',
            ),
          );
        }
      });
    });
  });

  describe('response', () => {
    test('returns Āgenskalns region with statistical data', async () => {
      const output = await getRegions(
        {},
        {
          start_date: '2018-01-01',
          end_date: '2018-02-01',
        },
      );

      expect(output).toContainEqual({
        name: 'Āgenskalns',
        price: {
          count: 3,
          min: jasmine.any(Number),
          max: jasmine.any(Number),
          mean: jasmine.any(Number),
          median: jasmine.any(Number),
          mode: jasmine.any(Number),
          standardDev: jasmine.any(Number),
        },
        price_per_sqm: {
          count: 2,
          min: jasmine.any(Number),
          max: jasmine.any(Number),
          mean: jasmine.any(Number),
          median: jasmine.any(Number),
          mode: jasmine.any(Number),
          standardDev: jasmine.any(Number),
        },
      });
    });

    test('returns the proper datatypes for regions without data', async () => {
      const output = await getRegions(
        {},
        {
          start_date: '2018-01-01',
          end_date: '2018-02-01',
        },
      );

      expect(output).toContainEqual({
        name: 'Voleri',
        price: {
          count: 0,
          min: null,
          max: null,
          mean: null,
          median: null,
          mode: null,
          standardDev: null,
        },
        price_per_sqm: {
          count: 0,
          min: null,
          max: null,
          mean: null,
          median: null,
          mode: null,
          standardDev: null,
        },
      });
    });
  });
});
