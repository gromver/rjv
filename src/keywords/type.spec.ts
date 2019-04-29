declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('type keyword', () => {
  it('Test string', () => {
    const model = new Model(
      {
        type: 'string',
      },
      'abc',
    );
    const ref = model.ref();
    const result = model.validateSync();
    expect(result).toMatchObject({
      valid: true,
    });
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set({});
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(1);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(undefined);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Test number', () => {
    const model = new Model(
      {
        type: 'number',
      },
      1,
    );
    const ref = model.ref();
    const result = model.validateSync();
    expect(result).toMatchObject({
      valid: true,
    });
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(1.5);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set({});
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set('1');
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(undefined);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Test integer', () => {
    const model = new Model(
      {
        type: 'integer',
      },
      1,
    );
    const ref = model.ref();
    const result = model.validateSync();
    expect(result).toMatchObject({
      valid: true,
    });
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(1.5);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set({});
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set('1');
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(undefined);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Test boolean', () => {
    const model = new Model(
      {
        type: 'boolean',
      },
      false,
    );
    const ref = model.ref();
    const result = model.validateSync();
    expect(result).toMatchObject({
      valid: true,
    });
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(true);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set({});
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set('1');
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(1);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(undefined);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Test array', () => {
    const model = new Model(
      {
        type: 'array',
      },
      [],
    );
    const ref = model.ref();
    const result = model.validateSync();
    expect(result).toMatchObject({
      valid: true,
    });
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(1);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set({});
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set('1');
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(undefined);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Test object', () => {
    const model = new Model(
      {
        type: 'object',
      },
      {},
    );
    const ref = model.ref();
    const result = model.validateSync();
    expect(result).toMatchObject({
      valid: true,
    });
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(1);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set([]);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set('1');
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(undefined);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Test multiple types', () => {
    const model = new Model(
      {
        type: ['array', 'integer'],
      },
      [],
    );
    const ref = model.ref();
    const result = ref.validateSync();
    expect(result).toMatchObject({
      valid: true,
    });
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set({});
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(1);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(1.23);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(undefined);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });
});
