declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

describe('maxProperties keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model();
    await model.init(
      {
        maxProperties: 2,
      },
      {},
    );

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

  it('Should expose error 1', async () => {
    const model = new Model();

    await expect(model.init(
      {
        // @ts-ignore
        maxProperties: '1',
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The schema of the "maxProperties" keyword should be a number.',
      });
  });

  it('Should expose error 2', async () => {
    const model = new Model();

    await expect(model.init(
      {
        maxProperties: -1,
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The "maxProperties" keyword can\'t be less then 0.',
      });
  });

  it('Should expose metadata', async () => {
    const model = new Model();
    await model.init(
      {
        maxProperties: 1,
      },
      '',
    );

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
