declare const describe;
declare const it;
declare const expect;

import Model from '../Model';

describe('if keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
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
    await model.prepare();

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
    const model = new Model(
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
    await model.prepare();

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

  it('Should expose error #1', async () => {
    await expect(() => new Model(
      {
        // @ts-ignore
        if: 1,
      },
      '',
    ))
      .toThrow('The value of the "if" keyword should be a schema object.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Model(
      {
        if: {},
      },
      '',
    ))
      .toThrow('For the "if" keyword You must specify at least the keyword "then" or "else".');
  });
});
