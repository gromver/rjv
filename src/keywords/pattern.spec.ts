declare const describe;
declare const it;
declare const expect;

import Model from '../Model';

describe('pattern keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        pattern: '[abc]+',
      },
      'a',
    );
    await model.prepare();

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
    expect(ref.state.message).toMatchObject({
      keyword: 'pattern',
      description: 'Should match pattern {pattern}',
      bindings: { pattern: '[abc]+' },
    });

    ref.setValue('def');
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Should expose error', async () => {
    await expect(() => new Model(
      {
        // @ts-ignore
        pattern: 1,
      },
      '',
    ))
      .toThrow('The schema of the "pattern" keyword should be a string.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        pattern: '[abc]+',
      },
      1,
    );
    await model.prepare();

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
