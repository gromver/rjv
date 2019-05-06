declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('contains keyword', () => {
  it('sync test', async () => {
    const model = new Model(
      {
        contains: {
          type: 'number',
        },
      },
      [1, 'a', null],
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([null, 'test']);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set([]);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(null);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('async test', async () => {
    const model = new Model(
      {
        contains: {
          resolveSchema: () => Promise.resolve({ type: 'number' }),
        },
      },
      [1, 'a', null],
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([null, 'test']);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set([]);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(null);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('schema test', async () => {
    const model = new Model(
      {
        not: {
          type: 'array',
          items: {
            not: { type: 'number' },
          },
        },
      },
      [1, 'a', null],
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([null, 'test']);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set([]);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(null);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);
  });

  it('Should throw errors', async () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          contains: 1,
        },
        '',
      );
    }).toThrow('The schema of the "contains" keyword should be a schema object.');
  });
});
