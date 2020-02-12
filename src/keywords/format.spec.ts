declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

describe('format keyword', () => {
  it('Email format test', async () => {
    const model = new Model();
    await model.init(
      {
        format: 'email',
      },
      'test@mail.com',
    );

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

  it('Should expose error 1', async () => {
    const model = new Model();

    await expect(model.init(
      {
        // @ts-ignore
        format: 1,
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The schema of the "format" keyword should be a string.',
      });
  });

  it('Should expose error 2', async () => {
    const model = new Model();

    await expect(model.init(
      {
        format: 'foo',
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'Unknown string format supplied.',
      });
  });

  it('Should expose metadata', async () => {
    const model = new Model();
    await model.init(
      {
        format: 'email',
      },
      1,
    );

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
