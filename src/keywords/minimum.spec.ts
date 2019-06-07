declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('minimum keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        minimum: 5,
      },
      5,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(4);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    expect(ref.state.message).toMatchObject({
      keyword: 'minimum',
      description: 'Should be greater than or equal 5',
    });

    ref.set(null);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Some integration tests with exclusive mode', async () => {
    const model = new Model(
      {
        minimum: 5,
        exclusiveMinimum: true,
      },
      6,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(5);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    expect(ref.state.message).toMatchObject({
      keyword: 'minimum_exclusive',
      description: 'Should be greater than 5',
    });
  });

  it('Should throw errors', async () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          minimum: '1',
        },
        '',
      );
    }).toThrow('The schema of the "minimum" keyword should be a number.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        minimum: 5,
        exclusiveMinimum: true,
      },
      '',
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.minimum).toBe(undefined);
    expect(ref.state.exclusiveMinimum).toBe(undefined);

    ref.set(6);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);
    expect(ref.state).toMatchObject({
      minimum: 5,
      exclusiveMinimum: true,
    });

    ref.set(4);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    expect(ref.state).toMatchObject({
      minimum: 5,
      exclusiveMinimum: true,
    });
  });
});
