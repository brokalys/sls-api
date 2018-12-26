import { UserInputError } from 'apollo-server-lambda';

import { resolvers } from './resolvers';

jest.mock('serverless-mysql');

describe('getRegionalStats', () => {
  describe('validation', () => {
    test('end date must come after start date', async () => {
      try {
        await resolvers.Query.getRegionalStats(
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
        await resolvers.Query.getRegionalStats(
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
        await resolvers.Query.getRegionalStats(
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
        const output = await resolvers.Query.getRegionalStats(
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
          await resolvers.Query.getRegionalStats(
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
      const output = await resolvers.Query.getRegionalStats(
        {},
        {
          start_date: '2018-01-01',
          end_date: '2018-02-01',
        },
      );

      expect(output).toContainEqual({
        name: 'Āgenskalns',
        count: 3,
        min: jasmine.any(Number),
        max: jasmine.any(Number),
        mean: jasmine.any(Number),
        median: jasmine.any(Number),
        mode: jasmine.any(Number),
        standardDev: jasmine.any(Number),
      });
    });

    test('returns the proper datatypes for regions without data', async () => {
      const output = await resolvers.Query.getRegionalStats(
        {},
        {
          start_date: '2018-01-01',
          end_date: '2018-02-01',
        },
      );

      expect(output).toContainEqual({
        name: 'Voleri',
        count: 0,
        min: null,
        max: null,
        mean: null,
        median: null,
        mode: null,
        standardDev: null,
      });
    });
  });
});
