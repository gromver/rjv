declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

describe('applySchemas keyword', () => {
  it('Some integration tests 1', async () => {
    const model = new Model();
    await model.init(
      {
        applySchemas: [
          {
            type: 'number',
            maximum: 5,
          },
          {
            type: 'number',
            minimum: 3,
          },
        ],
      },
      3,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue(1);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue('abc');
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(6);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
  });

  it('Some integration tests 2', async () => {
    const model = new Model();
    await model.init(
      {
        applySchemas: [
          {
            type: 'number',
            maximum: 5,
          },
          {
            type: 'string',
          },
        ],
      },
      3,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(6);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue('abc');
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
  });

  it('Some integration tests 3', async () => {
    const model = new Model();
    await model.init(
      {
        applySchemas: [
          {
            if: { type: 'number' },
            then: { maximum: 5 },
          },
          {
            if: { type: 'string' },
            then: { minLength: 3 },
          },
        ],
      },
      3,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue(6);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue('abc');
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue('ab');
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBe(undefined);
  });

  it('Properties integration tests', async () => {
    const model = new Model();
    await model.init(
      {
        applySchemas: [
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
                type: 'number',
                minimum: 3,
              },
            },
          },
        ],
      },
      { a: 4 },
    );

    const ref = model.ref();
    const aRef = ref.ref('a');
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    aRef.setValue(1);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    aRef.setValue('abc');
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    aRef.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
  });

  it('Should expose error 1', async () => {
    const model = new Model();

    await expect(model.init(
      {
        // @ts-ignore
        applySchemas: 1,
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The schema of the "applySchemas" keyword should be an array of schemas.',
      });
  });

  it('Should expose error 2', async () => {
    const model = new Model();

    await expect(model.init(
      {
        // @ts-ignore
        applySchemas: [1],
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'Items of "applySchemas" keyword should be a schema object.',
      });
  });
});
