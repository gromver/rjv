declare const describe;
declare const it;
declare const expect;

import Model from '../Model';

describe('minProperties keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        minProperties: 2,
      },
      { a: 1, b: 2 },
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue({ a: 1 });
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state.message).toMatchObject({
      keyword: 'minProperties',
      description: 'Should not have fewer than {limit} properties',
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
        minProperties: '1',
      },
      '',
    ))
      .toThrow('The schema of the "minProperties" keyword should be a number.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Model(
      {
        minProperties: 0,
      },
      '',
    ))
      .toThrow('The "minProperties" keyword can\'t be less then 1.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        minProperties: 1,
      },
      '',
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.minProperties).toBe(undefined);

    ref.setValue({ a: 1, b: 2 });
    await ref.validate();
    expect(ref.state.valid).toBe(true);
    expect(ref.state).toMatchObject({
      minProperties: 1,
    });

    ref.setValue({});
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state).toMatchObject({
      minProperties: 1,
    });
  });
});
