declare const describe;
declare const it;
declare const expect;

import Model from '../Model';

describe('minItems keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        minItems: 2,
      },
      [1, 2],
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1]);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state.message).toMatchObject({
      keyword: 'minItems',
      description: 'Should not have fewer than {limit} items',
      bindings: { limit: 2 },
    });

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Should expose error #1', async () => {
    await expect(() => new Model(
      {
        // @ts-ignore
        minItems: '1',
      },
      '',
    ))
      .toThrow('The schema of the "minItems" keyword should be a number.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Model(
      {
        minItems: 0,
      },
      '',
    ))
      .toThrow('The "minItems" keyword can\'t be less then 1.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        minItems: 2,
      },
      1,
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.minItems).toBe(undefined);

    ref.setValue([1, 2]);
    await ref.validate();
    expect(ref.state.valid).toBe(true);
    expect(ref.state).toMatchObject({
      minItems: 2,
    });

    ref.setValue([1]);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state).toMatchObject({
      minItems: 2,
    });
  });
});
