import utils from '../utils';

declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';

describe('validate keyword', () => {
  it('Should work with async validation function', async () => {
    const validator = new Validator(
      {
        validate: (ref) => {
          return Promise.resolve().then(() => {
            if (utils.checkDataType('number', ref.value)) {
              const value = ref.value;

              if (value > 5) {
                return true;
              }

              return 'Value should be greater than 5.';
            }

            return undefined;
          });
        },
      },
    );

    await expect(validator.validateData(10)).resolves.toMatchObject({ valid: true });

    await expect(validator.validateData(5)).resolves.toMatchObject({
      valid: false,
      results: {
        '/': {
          valid: false,
          messages: [
            {
              success: false,
              keyword: 'inline',
              description: 'Value should be greater than 5.',
            },
          ],
        },
      },
    });

    const res = await validator.validateData('string');
    expect(res.valid).toBe(false);
    expect(res.results['/']).toBe(undefined);
  });

  it('Should work with sync validation function', async () => {
    const validator = new Validator(
      {
        validate: (ref) => {
          if (utils.checkDataType('number', ref.value)) {
            const value = ref.value;

            if (value > 5) {
              return true;
            }

            return 'Value should be greater than 5.';
          }

          return undefined;
        },
      },
    );
    await expect(validator.validateData(10)).resolves.toMatchObject({ valid: true });

    await expect(validator.validateData(5)).resolves.toMatchObject({
      valid: false,
      results: {
        '/': {
          valid: false,
          messages: [
            {
              success: false,
              keyword: 'inline',
              description: 'Value should be greater than 5.',
            },
          ],
        },
      },
    });

    const res = await validator.validateData('string');
    expect(res.valid).toBe(false);
    expect(res.results['/']).toBe(undefined);
  });

  it('Should expose error', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        validate: {},
      },
    ))
      .toThrow('The schema of the "validate" keyword should be an async validation function.');
  });
});
