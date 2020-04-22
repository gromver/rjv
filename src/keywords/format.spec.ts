declare const describe;
declare const it;
declare const expect;

import Model from '../Model';

describe('format keyword', () => {
  it('Email format test', async () => {
    const model = new Model(
      {
        format: 'email',
      },
      'test@mail.com',
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue('foo');
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue('');
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  // todo: cover with tests all format types

  it('Should expose error #1', async () => {
    await expect(() => new Model(
      {
        // @ts-ignore
        format: 1,
      },
      '',
    ))
      .toThrow('The schema of the "format" keyword should be a string.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Model(
      {
        format: 'foo',
      },
      '',
    ))
      .toThrow('Unknown string format supplied.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        format: 'email',
      },
      1,
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.format).toBe(undefined);

    ref.setValue('test@mail.com');
    await ref.validate();
    expect(ref.state.valid).toBe(true);
    expect(ref.state).toMatchObject({
      format: 'email',
    });

    ref.setValue('foo');
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state).toMatchObject({
      format: 'email',
      message: {
        description: 'Should match format "email"',
        bindings: {
          format: 'email',
        },
      },
    });
  });
});
