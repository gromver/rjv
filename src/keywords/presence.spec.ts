declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

describe('presence keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model();
    await model.init(
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

  it('Test default and presence keywords case 1', async () => {
    const model = new Model();
    await model.init(
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

    const ref = model.ref();
    const fooRef = ref.ref('foo');

    await ref.validate();
    expect(fooRef.state.valid).toBe(false);
  });

  it('Test default and presence keywords case 2', async () => {
    const model = new Model();
    await model.init(
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

    const ref = model.ref();
    const fooRef = ref.ref('foo');

    await ref.validate();
    expect(fooRef.state.valid).toBe(true);
    expect(fooRef.getValue()).toBe('abc');
  });

  it('Should expose error', async () => {
    const model = new Model();

    await expect(model.init(
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
      .rejects
      .toMatchObject({
        message: 'The schema of the "presence" keyword should be a boolean value or an object.',
      });
  });
});
