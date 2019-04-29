declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('presence keyword', () => {
  it('Some integration tests', () => {
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

    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
    expect(fooRef.state.type).toBe(StateTypes.PRISTINE);
    expect(barRef.state.type).toBe(StateTypes.PRISTINE);
    expect(carRef.state.type).toBe(StateTypes.PRISTINE);
    expect(fooRef.isShouldNotBeBlank).toBe(true);
    expect(barRef.isShouldNotBeBlank).toBe(true);
    expect(carRef.isShouldNotBeBlank).toBe(false);

    fooRef.set('');
    ref.validateSync();
    expect(fooRef.state.type).toBe(StateTypes.ERROR);

    fooRef.set('abc');
    ref.validateSync();
    expect(fooRef.state.type).toBe(StateTypes.SUCCESS);

    fooRef.set(null);
    ref.validateSync();
    expect(fooRef.state.type).toBe(StateTypes.PRISTINE);

    barRef.set('   ');
    ref.validateSync();
    expect(barRef.state.type).toBe(StateTypes.ERROR);
    expect(barRef.value).toBe('');

    barRef.set(' foo ');
    ref.validateSync();
    expect(barRef.state.type).toBe(StateTypes.SUCCESS);
    expect(barRef.value).toBe('foo');
  });

  it('Test default and presence keywords case 1', () => {
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

    model.validateSync();
    expect(fooRef.state.type).toBe(StateTypes.ERROR);
  });

  it('Test default and presence keywords case 2', () => {
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

    model.validateSync();
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
