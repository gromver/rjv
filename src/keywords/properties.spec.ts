declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

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

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.relativeRef(['foo']).set('test');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(null);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
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

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);
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

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);
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
      },
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.relativeRef(['bar']).set('bar');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
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

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.relativeRef(['bar']).set('bar');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.relativeRef(['bar']).set(1);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
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

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.relativeRef(['bar']).set('bar');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.relativeRef(['bar']).set(1);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
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

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.relativeRef(['bar']).set('bar');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.relativeRef(['bar']).set(1);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    expect((ref.state as any).message.bindings).toMatchObject({
      invalidProperties: ['bar'],
    });
  });

});
