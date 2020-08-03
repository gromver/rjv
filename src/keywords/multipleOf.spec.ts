declare const describe;
declare const it;
declare const expect;

import Model from '../Model';

describe('multipleOf keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        multipleOf: 2,
      },
      4,
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue(4.1);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state.message).toMatchObject({
      keyword: 'multipleOf',
      description: 'Should be multiple of {multiplier}',
      bindings: { multiplier: 2 },
    });

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Should expose error #1', async () => {
    await expect(() => new Model(
      {
        // @ts-ignore
        multipleOf: '1',
      },
      '',
    ))
      .toThrow('The schema of the "multipleOf" keyword should be a number.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Model(
      {
        multipleOf: 0,
      },
      '',
    ))
      .toThrow('The "multipleOf" keyword can\'t be zero.');
  });
});
