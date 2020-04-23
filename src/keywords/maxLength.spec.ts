declare const describe;
declare const it;
declare const expect;

import Model from '../Model';

describe('maxLength keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        maxLength: 3,
      },
      'abc',
    );
    await model.prepare();

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

  it('Should expose error #1', async () => {
    await expect(() => new Model(
      {
        // @ts-ignore
        maxLength: '1',
      },
      '',
    ))
      .toThrow('The schema of the "maxLength" keyword should be a number.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Model(
      {
        maxLength: -1,
      },
      '',
    ))
      .toThrow('The "maxLength" keyword can\'t be less then 0.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        maxLength: 3,
      },
      1,
    );
    await model.prepare();

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
