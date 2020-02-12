declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

describe('const keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model();
    await model.init(
      {
        const: 'test',
      },
      'test',
    );

    const ref = model.ref();
    expect(ref.state.valid).toBe(true);
    expect(ref.state.const).toBe('test');

    ref.setValue('foo');
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
  });

  it('Some integration tests with custom func', async () => {
    const model = new Model();
    await model.init(
      {
        const: () => 'test',
      },
      'test',
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue('foo');
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
  });
});
