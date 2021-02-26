import Ref from './utils/Ref';

declare const describe;
declare const it;
declare const expect;

import Validator from './Validator';
import Storage from './utils/Storage';

describe('Validator::constructor tests', () => {
  it('should create Validator instances', () => {
    expect(new Validator({}))
      .toMatchObject({
        options: {
          coerceTypes: false,
          removeAdditional: false,
          validateFirst: true,
          errors: {},
          warnings: {},
          keywords: [],
        },
      });
    const opts = {
      coerceTypes: true,
      removeAdditional: true,
      validateFirst: false,
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
  it('should get invalid result when schema doesn\'t have applicable rules', async () => {
    const validator = new Validator({
      minimum: 1,
    });

    await expect(validator.validateData('abc'))
      .resolves
      .toMatchObject({
        valid: false,
        results: {
          '/': undefined,
        },
      });
  });

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
    // @ts-ignore
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

describe('Validator::validateRef tests', () => {
  it('should get proper validation results with coerceTypes=true', async () => {
    const validator = new Validator({
      presence: true,
      type: 'number',
    });

    const ref = new Ref(new Storage('123'));

    await expect(validator.validateRef(ref, { coerceTypes: true }))
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
    expect(ref.value).toEqual(123);
  });

  it('should get proper validation results with removeAdditional=true', async () => {
    const validator = new Validator({
      properties: {
        a: { type: 'string' },
      },
      additionalProperties: false,
    });

    const ref = new Ref(new Storage({
      a: 'a',
      b: 'b',
      c: 'c',
    }));

    await expect(validator.validateRef(ref, { removeAdditional: true }))
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
    const props = Object.keys(ref.value);
    expect(props).toHaveLength(1);
    expect(props[0]).toEqual('a');
  });

  it('should get proper validation result validating nested ref', async () => {
    const validator = new Validator({
      presence: true,
      type: 'number',
    });

    const ref = new Ref(
      new Storage({
        foo: 123,
      }),
      '/foo',
    );
    const res = await validator.validateRef(ref);
    expect(res)
      .toMatchObject({
        valid: true,
        results: {
          '/foo': {
            valid: true,
            messages: [],
          },
        },
      });
    const props = Object.keys(res.results);
    expect(props).toHaveLength(1);
    expect(props[0]).toEqual('/foo');
  });
});

describe('Validator::validateStorage tests', () => {
  it('should get proper validation results with coerceTypes=true', async () => {
    const validator = new Validator({
      presence: true,
      type: 'number',
    });

    const storage = new Storage('123');

    await expect(validator.validateStorage(storage, { coerceTypes: true }))
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
    expect(storage.get([])).toEqual(123);
  });

  it('should get proper validation results with removeAdditional=true', async () => {
    const validator = new Validator({
      properties: {
        a: { type: 'string' },
      },
      additionalProperties: false,
    });

    const storage = new Storage({
      a: 'a',
      b: 'b',
      c: 'c',
    });

    await expect(validator.validateStorage(storage, { removeAdditional: true }))
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
    const props = Object.keys(storage.get([]));
    expect(props).toHaveLength(1);
    expect(props[0]).toEqual('a');
  });
});
