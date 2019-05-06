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
});
