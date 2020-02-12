declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

describe('maxLength keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model();
    await model.init(
      {
        maxLength: 3,
      },
      'abc',
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue('abcd');
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
        maxLength: '1',
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The schema of the "maxLength" keyword should be a number.',
      });
  });

  it('Should expose error 2', async () => {
    const model = new Model();

    await expect(model.init(
      {
        maxLength: -1,
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The "maxLength" keyword can\'t be less then 0.',
      });
  });

  it('Should expose metadata', async () => {
    const model = new Model();
    await model.init(
      {
        maxLength: 3,
      },
      1,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.maxLength).toBe(undefined);

    ref.setValue('abc');
    await ref.validate();
    expect(ref.state.valid).toBe(true);
    expect(ref.state).toMatchObject({
      maxLength: 3,
    });

    ref.setValue('abcd');
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state).toMatchObject({
      maxLength: 3,
    });
  });
});
