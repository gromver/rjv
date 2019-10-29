declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

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
        },
      },
      {
        bar: null,
      },
    );

    const ref = model.ref();
    const fooRef = ref.relativeRef(['foo']);
    const barRef = ref.relativeRef(['bar']);
    const carRef = ref.relativeRef(['car']);
    expect(fooRef.isShouldNotBeBlank).toBe(false);
    expect(barRef.isShouldNotBeBlank).toBe(false);
    expect(carRef.isShouldNotBeBlank).toBe(false);

    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    expect(fooRef.state.type).toBe(StateTypes.ERROR);
    expect(barRef.state.type).toBe(StateTypes.SUCCESS);
    expect(carRef.state.type).toBe(StateTypes.PRISTINE);
    expect(fooRef.isShouldNotBeBlank).toBe(true);
    expect(barRef.isShouldNotBeBlank).toBe(true);
    expect(carRef.isShouldNotBeBlank).toBe(false);

    fooRef.set('');
    await ref.validate();
    expect(fooRef.state.type).toBe(StateTypes.ERROR);

    fooRef.set('abc');
    await ref.validate();
    expect(fooRef.state.type).toBe(StateTypes.SUCCESS);

    fooRef.set(null);
    await ref.validate();
    expect(fooRef.state.type).toBe(StateTypes.SUCCESS);

    fooRef.set(0);
    await ref.validate();
    expect(fooRef.state.type).toBe(StateTypes.SUCCESS);

    fooRef.set([]);
    await ref.validate();
    expect(fooRef.state.type).toBe(StateTypes.SUCCESS);

    fooRef.set({});
    await ref.validate();
    expect(fooRef.state.type).toBe(StateTypes.SUCCESS);

    barRef.set('   ');
    await ref.validate();
    expect(barRef.state.type).toBe(StateTypes.ERROR);
    expect(barRef.value).toBe('');

    barRef.set(' foo ');
    await ref.validate();
    expect(barRef.state.type).toBe(StateTypes.SUCCESS);
    expect(barRef.value).toBe('foo');
  });

  it('Test default and presence keywords case 1', async () => {
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

    const ref = model.ref();
    const fooRef = ref.relativeRef(['foo']);

    await ref.validate();
    expect(fooRef.state.type).toBe(StateTypes.ERROR);
  });

  it('Test default and presence keywords case 2', async () => {
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

    const ref = model.ref();
    const fooRef = ref.relativeRef(['foo']);

    await ref.validate();
    expect(fooRef.state.type).toBe(StateTypes.SUCCESS);
    expect(fooRef.value).toBe('abc');
  });

  it('Should throw an error', async () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          properties: {
            foo: {
              presence: null,
            },
          },
        },
        '',
      );
    }).toThrow('The schema of the "presence" keyword should be a boolean value or an object.');
  });
});
