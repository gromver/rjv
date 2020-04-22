declare const describe;
declare const it;
declare const expect;

import Model from '../Model';

describe('properties keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        properties: {
          car: { properties: { a: { type: 'boolean' } } },
          foo: { type: 'number' },
          bar: { type: 'string' },
        },
      },
      {
        car: { a: true },
        foo: 1,
        bar: 'test',
      },
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.ref('foo').setValue('test');
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Test additionalProperties=undefined', async () => {
    const model = new Model(
      {
        properties: {
          foo: { type: 'number' },
        },
      },
      {
        foo: 1,
        bar: 'bar',
        car: 'car',
      },
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);
  });

  it('Test additionalProperties=true', async () => {
    const model = new Model(
      {
        properties: {
          foo: { type: 'number' },
        },
        additionalProperties: true,
      },
      {
        foo: 1,
        bar: 'bar',
        car: 'car',
      },
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);
  });

  it('Test additionalProperties=false', async () => {
    const model = new Model(
      {
        properties: {
          foo: { type: 'number' },
        },
        additionalProperties: false,
      },
      {
        foo: 1,
        bar: 1,
      },
    );
    await model.prepare();

    const ref = model.ref();
    expect(ref.state.valid).toBe(false);
    expect((ref.state as any).message.bindings).toMatchObject({
      invalidProperties: ['bar'],
    });
  });

  it('Test additionalProperties=schema', async () => {
    const model = new Model(
      {
        properties: {
          foo: { type: 'number' },
        },
        additionalProperties: {
          type: 'string',
        },
      },
      {
        foo: 1,
      },
    );
    await model.prepare();

    const ref = model.ref();
    expect(ref.state.valid).toBe(true);

    ref.ref('bar').setValue('bar');
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.ref('bar').setValue(1);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect((ref.state as any).message.bindings).toMatchObject({
      invalidProperties: ['bar'],
    });
  });

  it('Async test with additionalProperties=sync schema', async () => {
    const model = new Model(
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
      {
        foo: 1,
      },
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.ref('bar').setValue('bar');
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.ref('bar').setValue(1);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect((ref.state as any).message.bindings).toMatchObject({
      invalidProperties: ['bar'],
    });
  });

  it('Async test with additionalProperties=async schema', async () => {
    const model = new Model(
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
      {
        foo: 1,
      },
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.ref('bar').setValue('bar');
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.ref('bar').setValue(1);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect((ref.state as any).message.bindings).toMatchObject({
      invalidProperties: ['bar'],
    });
  });

  it('Test removeAdditional keyword', async () => {
    const model = new Model(
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
      {
        car: { a: true },
        foo: 0,
        additional1: 1,
        bar: {
          baz: 'abc',
          additional2: 2,
        },
      },
    );
    await model.prepare();

    const ref = model.ref();
    const isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toEqual({ foo: 0, bar: { baz: 'abc', additional2: 2 } });
  });

  it('Test removeAdditional model\'s option', async () => {
    const model = new Model(
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
        car: { a: true },
        foo: 0,
        additional1: 1,
        bar: {
          baz: 'abc',
          additional2: 2,
        },
      },
      {
        validation: { removeAdditional: true },
      },
    );
    await model.prepare();

    const ref = model.ref();
    const isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toEqual({ foo: 0, bar: { baz: 'abc', additional2: 2 } });
  });

  it('Test removeAdditional validation\'s option', async () => {
    const model = new Model(
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
        car: { a: true },
        foo: 0,
        additional1: 1,
        bar: {
          baz: 'abc',
          additional2: 2,
        },
      },
    );
    await model.prepare();

    const ref = model.ref();
    const isValid = await ref.validate({
      removeAdditional: true,
    });
    expect(isValid).toBe(true);
    expect(ref.getValue()).toEqual({ foo: 0, bar: { baz: 'abc', additional2: 2 } });
  });
});
