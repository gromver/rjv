declare const describe;
declare const it;
declare const expect;

import Model from '../Model';

describe('maxProperties keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        maxProperties: 2,
      },
      {},
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue({ a: 1, b: 2, c: 3 });
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Should expose error #1', async () => {
    await expect(() => new Model(
      {
        // @ts-ignore
        maxProperties: '1',
      },
      '',
    ))
      .toThrow('The schema of the "maxProperties" keyword should be a number.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Model(
      {
        maxProperties: -1,
      },
      '',
    ))
      .toThrow('The "maxProperties" keyword can\'t be less then 0.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        maxProperties: 1,
      },
      '',
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.maxProperties).toBe(undefined);

    ref.setValue({});
    await ref.validate();
    expect(ref.state.valid).toBe(true);
    expect(ref.state).toMatchObject({
      maxProperties: 1,
    });

    ref.setValue({ a: 1, b: 2 });
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state).toMatchObject({
      maxProperties: 1,
    });
  });
});
