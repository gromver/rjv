declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

describe('anyOf keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model();
    await model.init(
      {
        anyOf: [
          {
            type: 'number',
            maximum: 5,
          },
          {
            type: 'string',
            maxLength: 3,
          },
        ],
      },
      1,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue('abc');
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue(6);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue('abcd');
    await ref.validate();
    expect(ref.state.valid).toBe(false);
  });

  it('Properties integration tests', async () => {
    const model = new Model();
    await model.init(
      {
        anyOf: [
          {
            properties: {
              a: {
                type: 'number',
                maximum: 5,
              },
            },
          },
          {
            properties: {
              a: {
                type: 'string',
                minLength: 3,
              },
            },
          },
        ],
      },
      { a: 1 },
    );

    const ref = model.ref();
    const aRef = ref.ref('a');
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    aRef.setValue('abc');
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    aRef.setValue(6);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    aRef.setValue('ab');
    await ref.validate();
    expect(ref.state.valid).toBe(false);
  });

  it('Should expose error 1', async () => {
    const model = new Model();

    await expect(model.init(
      {
        // @ts-ignore
        anyOf: 1,
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The schema of the "anyOf" keyword should be an array of schemas.',
      });
  });

  it('Should expose error 2', async () => {
    const model = new Model();

    await expect(model.init(
      {
        // @ts-ignore
        anyOf: [1],
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'Items of "anyOf" keyword should be a schema object.',
      });
  });
});
