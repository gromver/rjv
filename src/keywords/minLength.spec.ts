declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('minLength keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        minLength: 3,
      },
      'abc',
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set('ab');
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
          minLength: '1',
        },
        '',
      );
    }).toThrow('The schema of the "minLength" keyword should be a number.');

    expect(() => {
      new Model(
        {
          minLength: 0,
        },
        '',
      );
    }).toThrow('The "minLength" keyword can\'t be less then 1.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        minLength: 3,
      },
      1,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.minLength).toBe(undefined);

    ref.set('abc');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);
    expect(ref.state).toMatchObject({
      minLength: 3,
    });

    ref.set('ab');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    expect(ref.state).toMatchObject({
      minLength: 3,
    });
  });
});
