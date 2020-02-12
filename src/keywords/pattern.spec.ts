declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

describe('pattern keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model();
    await model.init(
      {
        pattern: '[abc]+',
      },
      'a',
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue('abcd');
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue('cde');
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue('');
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue('def');
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Should expose error', async () => {
    const model = new Model();

    await expect(model.init(
      {
        // @ts-ignore
        pattern: 1,
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The schema of the "pattern" keyword should be a string.',
      });
  });

  it('Should expose metadata', async () => {
    const model = new Model();
    await model.init(
      {
        pattern: '[abc]+',
      },
      1,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.pattern).toBe(undefined);

    ref.setValue('abcd');
    await ref.validate();
    expect(ref.state.valid).toBe(true);
    expect(ref.state).toMatchObject({
      pattern: '[abc]+',
    });

    ref.setValue('def');
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state).toMatchObject({
      pattern: '[abc]+',
    });
  });
});
