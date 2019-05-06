declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('const keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        const: 'test',
      },
      'test',
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set('foo');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(null);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });

  it('Some integration tests with custom func', async () => {
    const model = new Model(
      {
        const: () => 'test',
      },
      'test',
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set('foo');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(null);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });
});
