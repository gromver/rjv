declare const describe;
declare const it;
declare const expect;

import Model from '../Model';

describe('required keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        required: ['foo', 'bar'],
      },
      {
        bar: null,
      },
    );
    await model.prepare();

    const ref = model.ref();
    const fooRef = ref.ref('foo');
    const barRef = ref.ref('bar');
    const carRef = ref.ref('car');
    expect(ref.state.valid).toBe(false);
    expect(fooRef.state.valid).toBeUndefined();
    expect(barRef.state.valid).toBeUndefined();
    expect(carRef.state.valid).toBeUndefined();
    expect(fooRef.isRequired).toBe(true);
    expect(barRef.isRequired).toBe(true);
    expect(carRef.isRequired).toBe(false);

    fooRef.setValue(undefined);
    await ref.validate();
    expect(ref.state.valid).toBe(true);
    expect(fooRef.state.valid).toBeUndefined();

    fooRef.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBe(true);
    expect(fooRef.state.valid).toBeUndefined();
  });
});
