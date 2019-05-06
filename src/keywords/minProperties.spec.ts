declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('minProperties keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        minProperties: 2,
      },
      { a: 1, b: 2 },
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set({ a: 1 });
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(null);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Should throw errors', async () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          minProperties: '1',
        },
        '',
      );
    }).toThrow('The schema of the "minProperties" keyword should be a number.');

    expect(() => {
      new Model(
        {
          minProperties: 0,
        },
        '',
      );
    }).toThrow('The "minProperties" keyword can\'t be less then 1.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        minProperties: 1,
      },
      '',
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.minProperties).toBe(undefined);

    ref.set({ a: 1, b: 2 });
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);
    expect(ref.state).toMatchObject({
      minProperties: 1,
    });

    ref.set({});
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    expect(ref.state).toMatchObject({
      minProperties: 1,
    });
  });
});
