declare const describe;
declare const it;
declare const expect;

import Validator from './Validator';

describe('Validator::constructor tests', () => {
  it('should create Validator instances', () => {
    expect(new Validator({}))
      .toMatchObject({
        options: {
          coerceTypes: false,
          removeAdditional: false,
          validateFirst: false,
          errors: {},
          warnings: {},
          keywords: [],
        },
      });
    const opts = {
      coerceTypes: true,
      removeAdditional: true,
      validateFirst: true,
      errors: { foo: 'foo' },
      warnings: { bar: 'bar' },
    };
    expect(new Validator({}, opts))
      .toMatchObject({
        options: opts,
      });
  });
});

describe('Validator::validateData tests', () => {
  it('should get proper validation results with validateFirst=false', async () => {
    const validator = new Validator({
      presence: true,
      type: 'number',
    });

    await expect(validator.validateData('', { validateFirst: false }))
      .resolves
      .toMatchObject({
        valid: false,
        results: {
          '/': {
            valid: false,
            messages: [
              {
                success: false,
                keyword: 'presence',
              },
              {
                success: false,
                keyword: 'type',
              },
            ],
          },
        },
      });
    await expect(validator.validateData(0, { validateFirst: false }))
      .resolves
      .toMatchObject({
        valid: true,
        results: {
          '/': {
            valid: true,
            messages: [],
          },
        },
      });
  });

  it('should get proper validation results with validateFirst=true', async () => {
    const validator = new Validator({
      presence: true,
      type: 'number',
    });

    const res = await validator.validateData('', { validateFirst: true });
    expect(res)
      .toMatchObject({
        valid: false,
        results: {
          '/': {
            valid: false,
            messages: [
              {
                success: false,
                keyword: 'presence',
              },
            ],
          },
        },
      });
    expect(res.results['/'].messages).toHaveLength(1);

    await expect(validator.validateData(0, { validateFirst: true }))
      .resolves
      .toMatchObject({
        valid: true,
        results: {
          '/': {
            valid: true,
            messages: [],
          },
        },
      });
  });
});
