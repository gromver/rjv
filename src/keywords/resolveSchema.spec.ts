declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';

describe('resolveSchema keyword', () => {
  it('Async integration tests', async () => {
    const validator = new Validator(
      {
        properties: {
          expect: {
            enum: ['string', 'number'],
          },
          value: {
            resolveSchema: (ref) => {
              const expect = ref.ref('/expect').value;

              return Promise.resolve({
                type: expect,
              });
            },
          },
        },
      },
    );
    await expect(validator.validateData({
      expect: 'number',
      value: 1,
    })).resolves.toMatchObject({ valid: true });

    await expect(validator.validateData({
      expect: 'number',
      value: 'foo',
    })).resolves.toMatchObject({ valid: false });

    await expect(validator.validateData({
      expect: 'string',
      value: 'foo',
    })).resolves.toMatchObject({ valid: true });

    await expect(validator.validateData({
      expect: 'string',
      value: 1,
    })).resolves.toMatchObject({ valid: false });
  });

  it('Sync integration tests', async () => {
    const validator = new Validator(
      {
        properties: {
          expect: {
            enum: ['string', 'number'],
          },
          value: {
            resolveSchema: (ref) => {
              const expect = ref.ref('/expect').value;

              return {
                type: expect,
              };
            },
          },
        },
      },
    );
    await expect(validator.validateData({
      expect: 'number',
      value: 1,
    })).resolves.toMatchObject({ valid: true });

    await expect(validator.validateData({
      expect: 'number',
      value: 'foo',
    })).resolves.toMatchObject({ valid: false });

    await expect(validator.validateData({
      expect: 'string',
      value: 'foo',
    })).resolves.toMatchObject({ valid: true });

    await expect(validator.validateData({
      expect: 'string',
      value: 1,
    })).resolves.toMatchObject({ valid: false });
  });

  it('Should expose error', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        resolveSchema: {},
      },
    ))
      .toThrow('The schema of the "resolveSchema" keyword should be a function returns a schema.');
  });

  it('Should get error description specified in resolveSchema', async () => {
    const CUSTOM_MESSAGE = 'Custom error message';

    const validator = new Validator(
      {
        resolveSchema: async () => ({
          presence: true,
          const: 'abc',
          errors: {
            const: CUSTOM_MESSAGE,
          },
        }),
      },
    );
    const res = await validator.validateData('a');

    expect(res.results['/']!.messages[0].description).toBe(CUSTOM_MESSAGE);
  });
});
