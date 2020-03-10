declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

describe('required keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model();
    await model.init(
      {
        required: ['foo', 'bar'],
      },
      {
        bar: null,
      },
    );

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
