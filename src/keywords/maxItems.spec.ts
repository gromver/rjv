declare const describe;
declare const it;
declare const expect;

import Model from '../Model';

describe('maxItems keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        maxItems: 2,
      },
      [1, 2],
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 2, 3]);
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
        maxItems: '1',
      },
      '',
    ))
      .toThrow('The schema of the "maxItems" keyword should be a number.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Model(
      {
        maxItems: -1,
      },
      '',
    ))
      .toThrow('The "maxItems" keyword can\'t be less then 0.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        maxItems: 2,
      },
      1,
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.maxItems).toBe(undefined);

    ref.setValue([]);
    await ref.validate();
    expect(ref.state.valid).toBe(true);
    expect(ref.state).toMatchObject({
      maxItems: 2,
    });

    ref.setValue([1, 2, 3]);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state).toMatchObject({
      maxItems: 2,
    });
  });
});
