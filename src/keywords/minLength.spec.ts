declare const describe;
declare const it;
declare const expect;

import Model from '../Model';

describe('minLength keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        minLength: 3,
      },
      'abc',
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue('ab');
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state.message).toMatchObject({
      keyword: 'minLength',
      description: 'Should not be shorter than {limit} characters',
      bindings: { limit: 3 },
    });

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Should expose error #1', async () => {
    await expect(() => new Model(
      {
        // @ts-ignore
        minLength: '1',
      },
      '',
    ))
      .toThrow('The schema of the "minLength" keyword should be a number.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Model(
      {
        minLength: 0,
      },
      '',
    ))
      .toThrow('The "minLength" keyword can\'t be less then 1.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        minLength: 3,
      },
      1,
    );
    await model.prepare();

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
