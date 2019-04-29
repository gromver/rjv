declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('minItems keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        minItems: 2,
      },
      [1, 2],
    );

    const ref = model.ref();
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1]);
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
          minItems: '1',
        },
        '',
      );
    }).toThrow('The schema of the "minItems" keyword should be a number.');

    expect(() => {
      new Model(
        {
          minItems: 0,
        },
        '',
      );
    }).toThrow('The "minItems" keyword can\'t be less then 1.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        minItems: 2,
      },
      1,
    );

    const ref = model.ref();
    ref.validate();
    expect(ref.state.minItems).toBe(undefined);

    ref.set([1, 2]);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);
    expect(ref.state).toMatchObject({
      minItems: 2,
    });

    ref.set([1]);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    expect(ref.state).toMatchObject({
      minItems: 2,
    });
  });
});
