declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('pattern keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        pattern: '[abc]+',
      },
      'a',
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set('abcd');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set('cde');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set('');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set('def');
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
          pattern: 1,
        },
        '',
      );
    }).toThrow('The schema of the "pattern" keyword should be a string.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        pattern: '[abc]+',
      },
      1,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.pattern).toBe(undefined);

    ref.set('abcd');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);
    expect(ref.state).toMatchObject({
      pattern: '[abc]+',
    });

    ref.set('def');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    expect(ref.state).toMatchObject({
      pattern: '[abc]+',
    });
  });
});
