declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

describe('if keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model();
    await model.init(
      {
        if: {
          type: 'number',
          maximum: 5,
        },
        then: {
          type: 'integer',
        },
        else: {
          type: 'number',
        },
      },
      5,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue(4.5);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(6);
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue('abc');
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
  });

  it('Properties integration tests', async () => {
    const model = new Model();
    await model.init(
      {
        if: {
          properties: {
            power: { minimum: 9000 },
          },
        },
        then: { required: ['disbelief'] },
        else: { required: ['confidence'] },
      },
      { power: 10000, disbelief: true },
    );

    const ref = model.ref();
    expect(ref.state.valid).toBe(true);

    ref.setValue({ power: 1000, confidence: true });
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue({});
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();

    ref.setValue({ power: 10000 });
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue({ power: 10000, confidence: true });
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue({ power: 1000 });
    await ref.validate();
    expect(ref.state.valid).toBe(false);
  });

  it('Should expose error 1', async () => {
    const model = new Model();

    await expect(model.init(
      {
        // @ts-ignore
        if: 1,
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The value of the "if" keyword should be a schema object.',
      });
  });

  it('Should expose error 2', async () => {
    const model = new Model();

    await expect(model.init(
      {
        if: {},
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'For the "if" keyword You must specify at least the keyword "then" or "else".',
      });
  });
});
