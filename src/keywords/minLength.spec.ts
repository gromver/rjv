declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

describe('minLength keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model();
    await model.init(
      {
        minLength: 3,
      },
      'abc',
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue('ab');
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
        minLength: '1',
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The schema of the "minLength" keyword should be a number.',
      });
  });

  it('Should expose error 2', async () => {
    const model = new Model();

    await expect(model.init(
      {
        minLength: 0,
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The "minLength" keyword can\'t be less then 1.',
      });
  });

  it('Should expose metadata', async () => {
    const model = new Model();
    await model.init(
      {
        minLength: 3,
      },
      1,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.minLength).toBe(undefined);

    ref.setValue('abc');
    await ref.validate();
    expect(ref.state.valid).toBe(true);
    expect(ref.state).toMatchObject({
      minLength: 3,
    });

    ref.setValue('ab');
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state).toMatchObject({
      minLength: 3,
    });
  });
});
