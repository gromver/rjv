declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('maxProperties keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        maxProperties: 2,
      },
      {},
    );

    const ref = model.ref();
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set({ a: 1, b: 2, c: 3 });
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(null);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Should throw errors', async () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          maxProperties: '1',
        },
        '',
      );
    }).toThrow('The schema of the "maxProperties" keyword should be a number.');

    expect(() => {
      new Model(
        {
          maxProperties: -1,
        },
        '',
      );
    }).toThrow('The "maxProperties" keyword can\'t be less then 0.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        maxProperties: 1,
      },
      '',
    );

    const ref = model.ref();
    ref.validate();
    expect(ref.state.maxProperties).toBe(undefined);

    ref.set({});
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);
    expect(ref.state).toMatchObject({
      maxProperties: 1,
    });

    ref.set({ a: 1, b: 2 });
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    expect(ref.state).toMatchObject({
      maxProperties: 1,
    });
  });
});
