declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

describe('minProperties keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model();
    await model.init(
      {
        minProperties: 2,
      },
      { a: 1, b: 2 },
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue({ a: 1 });
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
        minProperties: '1',
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The schema of the "minProperties" keyword should be a number.',
      });
  });

  it('Should expose error 2', async () => {
    const model = new Model();

    await expect(model.init(
      {
        minProperties: 0,
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The "minProperties" keyword can\'t be less then 1.',
      });
  });

  it('Should expose metadata', async () => {
    const model = new Model();
    await model.init(
      {
        minProperties: 1,
      },
      '',
    );

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
