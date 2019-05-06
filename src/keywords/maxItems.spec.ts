declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('maxItems keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        maxItems: 2,
      },
      [1, 2],
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 2, 3]);
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
          maxItems: '1',
        },
        '',
      );
    }).toThrow('The schema of the "maxItems" keyword should be a number.');

    expect(() => {
      new Model(
        {
          maxItems: -1,
        },
        '',
      );
    }).toThrow('The "maxItems" keyword can\'t be less then 0.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        maxItems: 2,
      },
      1,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.maxItems).toBe(undefined);

    ref.set([]);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);
    expect(ref.state).toMatchObject({
      maxItems: 2,
    });

    ref.set([1, 2, 3]);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    expect(ref.state).toMatchObject({
      maxItems: 2,
    });
  });
});
