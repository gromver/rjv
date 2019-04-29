declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('maxLength keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        maxLength: 3,
      },
      'abc',
    );

    const ref = model.ref();
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set('abcd');
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
          maxLength: '1',
        },
        '',
      );
    }).toThrow('The schema of the "maxLength" keyword should be a number.');

    expect(() => {
      new Model(
        {
          maxLength: -1,
        },
        '',
      );
    }).toThrow('The "maxLength" keyword can\'t be less then 0.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        maxLength: 3,
      },
      1,
    );

    const ref = model.ref();
    ref.validate();
    expect(ref.state.maxLength).toBe(undefined);

    ref.set('abc');
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);
    expect(ref.state).toMatchObject({
      maxLength: 3,
    });

    ref.set('abcd');
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    expect(ref.state).toMatchObject({
      maxLength: 3,
    });
  });
});
