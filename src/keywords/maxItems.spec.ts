declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

describe('maxItems keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model();
    await model.init(
      {
        maxItems: 2,
      },
      [1, 2],
    );

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

  it('Should expose error 1', async () => {
    const model = new Model();

    await expect(model.init(
      {
        // @ts-ignore
        maxItems: '1',
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The schema of the "maxItems" keyword should be a number.',
      });
  });

  it('Should expose error 2', async () => {
    const model = new Model();

    await expect(model.init(
      {
        maxItems: -1,
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The "maxItems" keyword can\'t be less then 0.',
      });
  });

  it('Should expose metadata', async () => {
    const model = new Model();
    await model.init(
      {
        maxItems: 2,
      },
      1,
    );

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
