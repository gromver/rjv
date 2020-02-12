declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

const ENUM = [1, { foo: 'bar' }, [1, 2, 3]];

describe('enum keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model();
    await model.init(
      {
        enum: ENUM,
      },
      1,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);
    expect(ref.state.enum).toBe(ENUM);

    ref.setValue(2);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue({ foo: 'bar' });
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 2, 3]);
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 2]);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
  });
});
