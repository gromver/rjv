declare const describe;
declare const it;
declare const expect;

import Model from '../Model';

describe('presence keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        properties: {
          foo: {
            presence: true,
          },
          bar: {
            presence: {
              trim: true,
            },
          },
          car: {},
        },
      },
      {
        bar: null,
      },
    );
    await model.prepare();

    const ref = model.ref();
    const fooRef = ref.ref('foo');
    const barRef = ref.ref('bar');
    const carRef = ref.ref('car');
    expect(fooRef.isShouldNotBeBlank).toBe(true);
    expect(barRef.isShouldNotBeBlank).toBe(true);
    expect(carRef.isShouldNotBeBlank).toBe(false);

    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(fooRef.state.valid).toBe(false);
    expect(fooRef.state.message).toMatchObject({
      keyword: 'presence',
      description: 'Should not be blank',
      bindings: { path: '/foo' },
    });
    expect(barRef.state.valid).toBe(true);
    expect(carRef.state.valid).toBeUndefined();
    expect(fooRef.isShouldNotBeBlank).toBe(true);
    expect(barRef.isShouldNotBeBlank).toBe(true);
    expect(carRef.isShouldNotBeBlank).toBe(false);

    fooRef.setValue('');
    await ref.validate();
    expect(fooRef.state.valid).toBe(false);

    fooRef.setValue('abc');
    await ref.validate();
    expect(fooRef.state.valid).toBe(true);

    fooRef.setValue(null);
    await ref.validate();
    expect(fooRef.state.valid).toBe(true);

    fooRef.setValue(0);
    await ref.validate();
    expect(fooRef.state.valid).toBe(true);

    fooRef.setValue([]);
    await ref.validate();
    expect(fooRef.state.valid).toBe(true);

    fooRef.setValue({});
    await ref.validate();
    expect(fooRef.state.valid).toBe(true);

    barRef.setValue('   ');
    await ref.validate();
    expect(barRef.state.valid).toBe(false);
    expect(barRef.getValue()).toBe('');

    barRef.setValue(' foo ');
    await ref.validate();
    expect(barRef.state.valid).toBe(true);
    expect(barRef.getValue()).toBe('foo');
  });

  it('Test default and presence keywords case #1', async () => {
    const model = new Model(
      {
        properties: {
          foo: {
            presence: {
              trim: true,
            },
            default: '',
          },
        },
      },
      {},
    );
    await model.prepare();

    const ref = model.ref();
    const fooRef = ref.ref('foo');

    await ref.validate();
    expect(fooRef.state.valid).toBe(false);
  });

  it('Test default and presence keywords case #2', async () => {
    const model = new Model(
      {
        properties: {
          foo: {
            presence: {
              trim: true,
            },
            default: ' abc ',
          },
        },
      },
      {},
    );
    await model.prepare();

    const ref = model.ref();
    const fooRef = ref.ref('foo');

    await ref.validate();
    expect(fooRef.state.valid).toBe(true);
    expect(fooRef.getValue()).toBe('abc');
  });

  it('Should expose error', async () => {
    await expect(() => new Model(
      {
        // @ts-ignore
        properties: {
          foo: {
            presence: null,
          },
        },
      },
      '',
    ))
      .toThrow('The schema of the "presence" keyword should be a boolean value or an object.');
  });
});
