declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('type keyword', () => {
  it('Test string', async () => {
    const model = new Model(
      {
        type: 'string',
      },
      'abc',
    );
    const ref = model.ref();
    const result = await model.validate();
    expect(result).toMatchObject({
      valid: true,
    });
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set({});
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(1);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(undefined);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Test number', async () => {
    const model = new Model(
      {
        type: 'number',
      },
      1,
    );
    const ref = model.ref();
    const result = await model.validate();
    expect(result).toMatchObject({
      valid: true,
    });
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(1.5);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set({});
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set('1');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(undefined);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Test integer', async () => {
    const model = new Model(
      {
        type: 'integer',
      },
      1,
    );
    const ref = model.ref();
    const result = await model.validate();
    expect(result).toMatchObject({
      valid: true,
    });
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(1.5);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set({});
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set('1');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(undefined);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Test boolean', async () => {
    const model = new Model(
      {
        type: 'boolean',
      },
      false,
    );
    const ref = model.ref();
    const result = await model.validate();
    expect(result).toMatchObject({
      valid: true,
    });
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(true);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set({});
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set('1');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(1);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(undefined);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Test array', async () => {
    const model = new Model(
      {
        type: 'array',
      },
      [],
    );
    const ref = model.ref();
    const result = await model.validate();
    expect(result).toMatchObject({
      valid: true,
    });
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(1);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set({});
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set('1');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(undefined);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Test object', async () => {
    const model = new Model(
      {
        type: 'object',
      },
      {},
    );
    const ref = model.ref();
    const result = await model.validate();
    expect(result).toMatchObject({
      valid: true,
    });
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(1);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set([]);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set('1');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(undefined);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Test multiple types', async () => {
    const model = new Model(
      {
        type: ['array', 'integer'],
      },
      [],
    );
    const ref = model.ref();
    const result = await ref.validate();
    expect(result).toMatchObject({
      valid: true,
    });
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set({});
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(1);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(1.23);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(undefined);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Coerce to number', async () => {
    const model = new Model(
      {
        type: 'number',
        coerceTypes: true,
      },
      '123',
    );
    const ref = model.ref();
    let result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe(123);

    ref.set(true);
    result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe(1);

    ref.set(false);
    result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe(0);

    ref.set('a123');
    result = await ref.validate();
    expect(result).toMatchObject({ valid: false });
    expect(ref.value).toBe('a123');
  });

  it('Coerce to integer', async () => {
    const model = new Model(
      {
        type: 'integer',
        coerceTypes: true,
      },
      '123',
    );
    const ref = model.ref();
    let result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe(123);

    ref.set(true);
    result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe(1);

    ref.set(false);
    result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe(0);

    ref.set('a123');
    result = await ref.validate();
    expect(result).toMatchObject({ valid: false });
    expect(ref.value).toBe('a123');

    ref.set('123.45');
    result = await ref.validate();
    expect(result).toMatchObject({ valid: false });
    expect(ref.value).toBe('123.45');
  });

  it('Coerce to number or integer', async () => {
    const model = new Model(
      {
        type: ['number', 'integer'],
        coerceTypes: true,
      },
      '123',
    );
    const ref = model.ref();
    let result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe(123);

    ref.set('123.45');
    result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe(123.45);

    ref.set('a123');
    result = await ref.validate();
    expect(result).toMatchObject({ valid: false });
    expect(ref.value).toBe('a123');
  });

  it('Coerce to string', async () => {
    const model = new Model(
      {
        type: 'string',
        coerceTypes: true,
      },
      123,
    );
    const ref = model.ref();
    let result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe('123');

    ref.set(123.45);
    result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe('123.45');

    ref.set(true);
    result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe('true');

    ref.set(false);
    result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe('false');

    const arr = [];
    ref.set(arr);
    result = await ref.validate();
    expect(result).toMatchObject({ valid: false });
    expect(ref.value).toBe(arr);
  });

  it('Coerce to boolean', async () => {
    const model = new Model(
      {
        type: 'boolean',
        coerceTypes: true,
      },
      null,
    );
    const ref = model.ref();
    let result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe(false);

    ref.set('false');
    result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe(false);

    ref.set(0);
    result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe(false);

    ref.set('true');
    result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe(true);

    ref.set(1);
    result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe(true);

    ref.set('');
    result = await ref.validate();
    expect(result).toMatchObject({ valid: false });
    expect(ref.value).toBe('');
  });

  it('Coerce to null', async () => {
    const model = new Model(
      {
        type: 'null',
        coerceTypes: true,
      },
      0,
    );
    const ref = model.ref();
    let result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe(null);

    ref.set('');
    result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe(null);

    ref.set(false);
    result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe(null);

    ref.set(123);
    result = await ref.validate();
    expect(result).toMatchObject({ valid: false });
    expect(ref.value).toBe(123);
  });

  it('Test model\'s coerceTypes option', async () => {
    const model = new Model(
      {
        type: 'number',
      },
      '123',
      {
        coerceTypes: true,
      },
    );
    const ref = model.ref();
    const result = await ref.validate();
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe(123);
  });

  it('Test validation\'s process coerceTypes option', async () => {
    const model = new Model(
      {
        type: 'number',
      },
      '123',
    );
    const ref = model.ref();
    const result = await ref.validate({
      coerceTypes: true,
    });
    expect(result).toMatchObject({ valid: true });
    expect(ref.value).toBe(123);
  });
});
