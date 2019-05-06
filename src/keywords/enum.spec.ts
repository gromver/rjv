declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

const ENUM = [1, { foo: 'bar' }, [1, 2, 3]];

const model = new Model(
  {
    enum: ENUM,
  },
  1,
);

describe('enum keyword', () => {
  it('Some integration tests', async () => {
    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);
    expect(ref.state.enum).toBe(ENUM);

    ref.set(2);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set({ foo: 'bar' });
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 2, 3]);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set([1, 2]);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });
});
