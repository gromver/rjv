declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('properties keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        properties: {
          car: { properties: { a: { type: 'boolean' } } },
          foo: { type: 'number' },
          bar: { type: 'string' },
        },
      },
    );

    const ref = new Ref(
      new Storage({
        car: { a: true },
        foo: 1,
        bar: 'test',
      }),
      '/',
    );

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.ref('foo').setValue('invalid value');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/'].messages[0]).toMatchObject({
      keyword: 'properties',
      description: 'Should have valid properties',
      bindings: { invalidProperties: ['foo'] },
    });

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('Test additionalProperties=undefined', async () => {
    const validator = new Validator(
      {
        properties: {
          foo: { type: 'number' },
        },
      },
    );

    const ref = new Ref(
      new Storage({
        foo: 1,
        bar: 'bar',
        car: 'car',
      }),
      '/',
    );

    const res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
  });

  it('Test additionalProperties=true', async () => {
    const validator = new Validator(
      {
        properties: {
          foo: { type: 'number' },
        },
        additionalProperties: true,
      },
    );

    const ref = new Ref(
      new Storage({
        foo: 1,
        bar: 'bar',
        car: 'car',
      }),
      '/',
    );

    const res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
  });

  it('Test additionalProperties=false', async () => {
    const validator = new Validator(
      {
        properties: {
          foo: { type: 'number' },
        },
        additionalProperties: false,
      },
    );

    const ref = new Ref(
      new Storage({
        foo: 1,
        bar: 1,
      }),
      '/',
    );

    const res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/'].messages[0].bindings).toMatchObject({
      invalidProperties: ['bar'],
    });
  });

  it('Test additionalProperties=schema', async () => {
    const validator = new Validator(
      {
        properties: {
          foo: { type: 'number' },
        },
        additionalProperties: {
          type: 'string',
        },
      },
    );

    const ref = new Ref(
      new Storage({
        foo: 1,
      }),
      '/',
    );

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.ref('bar').setValue('bar');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.ref('bar').setValue(1);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/'].messages[0].bindings).toMatchObject({
      invalidProperties: ['bar'],
    });
  });

  it('Async test with additionalProperties=sync schema', async () => {
    const validator = new Validator(
      {
        resolveSchema: () => Promise.resolve({
          properties: {
            foo: { type: 'number' },
          },
          additionalProperties: {
            type: 'string',
          },
        }),
      },
    );

    const ref = new Ref(
      new Storage({
        foo: 1,
      }),
      '/',
    );

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.ref('bar').setValue('bar');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.ref('bar').setValue(1);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/'].messages[0].bindings).toMatchObject({
      invalidProperties: ['bar'],
    });
  });

  it('Async test with additionalProperties=async schema', async () => {
    const validator = new Validator(
      {
        resolveSchema: () => Promise.resolve({
          properties: {
            foo: { type: 'number' },
          },
          additionalProperties: {
            resolveSchema: () => Promise.resolve({
              type: 'string',
            }),
          },
        }),
      },
    );

    const ref = new Ref(
      new Storage({
        foo: 1,
      }),
      '/',
    );

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.ref('bar').setValue('bar');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.ref('bar').setValue(1);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/'].messages[0].bindings).toMatchObject({
      invalidProperties: ['bar'],
    });
  });

  it('Test removeAdditional keyword', async () => {
    const validator = new Validator(
      {
        additionalProperties: false,
        removeAdditional: true,
        properties: {
          foo: { type: 'number' },
          bar: {
            additionalProperties: { type: 'number' },
            removeAdditional: true,
            properties: {
              baz: { type: 'string' },
            },
          },
        },
      },
    );

    const ref = new Ref(
      new Storage({
        car: { a: true },
        foo: 0,
        additional1: 1,
        bar: {
          baz: 'abc',
          additional2: 2,
        },
      }),
      '/',
    );

    const res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toEqual({ foo: 0, bar: { baz: 'abc', additional2: 2 } });
  });

  it('Test removeAdditional validation\'s option', async () => {
    const validator = new Validator(
      {
        additionalProperties: false,
        properties: {
          foo: { type: 'number' },
          bar: {
            additionalProperties: { type: 'number' },
            properties: {
              baz: { type: 'string' },
            },
          },
        },
      },
      {
        removeAdditional: true,
      },
    );

    const ref = new Ref(
      new Storage({
        car: { a: true },
        foo: 0,
        additional1: 1,
        bar: {
          baz: 'abc',
          additional2: 2,
        },
      }),
      '/',
    );

    const res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toEqual({ foo: 0, bar: { baz: 'abc', additional2: 2 } });
  });

  it('Test removeAdditional validate function\'s option', async () => {
    const validator = new Validator(
      {
        additionalProperties: false,
        properties: {
          foo: { type: 'number' },
          bar: {
            additionalProperties: { type: 'number' },
            properties: {
              baz: { type: 'string' },
            },
          },
        },
      },
    );

    const ref = new Ref(
      new Storage({
        car: { a: true },
        foo: 0,
        additional1: 1,
        bar: {
          baz: 'abc',
          additional2: 2,
        },
      }),
      '/',
    );

    const res = await validator.validateRef(ref, { removeAdditional: true });
    expect(res.valid).toBe(true);
    expect(ref.value).toEqual({ foo: 0, bar: { baz: 'abc', additional2: 2 } });
  });
});
