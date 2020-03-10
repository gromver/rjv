declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

describe('items keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model();
    await model.init(
      {
        items: {
          anyOf: [
            { type: 'number' },
            { type: 'string' },
          ],
        },
      },
      [1, 'test'],
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 'test', null]);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Some ajv tests 1', async () => {
    const model = new Model();
    await model.init(
      {
        items: {
          type: 'number',
        },
      },
      [1, 2, 3],
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 'test']);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue([]);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Some ajv tests 2', async () => {
    const model = new Model();
    await model.init(
      {
        items: [
          { type: 'integer' },
          { type: 'string' },
        ],
      },
      [1],
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 'test']);
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 'test', 2]);
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue(['test', 1]);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(['test']);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue([]);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Should expose error 1', async () => {
    const model = new Model();

    await expect(model.init(
      {
        // @ts-ignore
        items: 1,
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The schema of the "items" keyword should be an object or array of schemas.',
      });
  });

  it('Should expose error 2', async () => {
    const model = new Model();

    await expect(model.init(
      {
        // @ts-ignore
        items: [1],
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'Each item of the "items" keyword should be a schema object.',
      });
  });

  it('additionalItems test 1', async () => {
    const model = new Model();
    await model.init(
      {
        items: { type: 'integer' },
        additionalItems: { type: 'string' },
      },
      [],
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();

    ref.setValue([1, 2]);
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 'abc']);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
  });

  it('additionalItems test 2', async () => {
    const model = new Model();
    await model.init(
      {
        items: [
          { type: 'integer' },
          { type: 'integer' },
        ],
        additionalItems: true,
      },
      [],
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();

    ref.setValue([1, 2]);
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 2, 'abc']);
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 'abc']);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue([1, 'abc', 2]);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
  });

  it('additionalItems test 3', async () => {
    const model = new Model();
    await model.init(
      {
        items: [
          { type: 'integer' },
          { type: 'integer' },
        ],
        additionalItems: { type: 'string' },
      },
      [],
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();

    ref.setValue([1, 2]);
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 2, 'abc']);
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 2, 3]);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
  });

  it('additionalItems test 4', async () => {
    const model = new Model();
    await model.init(
      {
        items: [
          { type: 'integer' },
          { type: 'integer' },
        ],
        additionalItems: false,
      },
      [],
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();

    ref.setValue([1, 2]);
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 2, 3]);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state.message).toMatchObject({
      description: 'Should not have more than 2 items',
      bindings: { limit: 2 },
    });
  });

  it('additionalItems test 1', async () => {
    const model = new Model();
    await model.init(
      {
        items: { type: 'integer' },
        additionalItems: { resolveSchema: () => Promise.resolve({ type: 'string' }) },
      },
      [],
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();

    ref.setValue([1, 2]);
    await  ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 'abc']);
    await  ref.validate();
    expect(ref.state.valid).toBe(false);
  });

  it('additionalItems test 2', async () => {
    const model = new Model();
    await model.init(
      {
        items: [
          { resolveSchema: () => Promise.resolve({ type: 'integer' }) },
          { type: 'integer' },
        ],
        additionalItems: true,
      },
      [],
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();

    ref.setValue([1, 2]);
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 2, 'abc']);
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 'abc']);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue([1, 'abc', 2]);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
  });

  it('additionalItems test 3', async () => {
    const model = new Model();
    await model.init(
      {
        items: [
          { resolveSchema: () => Promise.resolve({ type: 'integer' }) },
          { type: 'integer' },
        ],
        additionalItems: { type: 'string' },
      },
      [],
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();

    ref.setValue([1, 2]);
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 2, 'abc']);
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 2, 3]);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
  });

  it('additionalItems test 4', async () => {
    const model = new Model();
    await model.init(
      {
        items: [
          { type: 'integer' },
          { type: 'integer' },
        ],
        additionalItems: { resolveSchema: () => Promise.resolve({ type: 'string' }) },
      },
      [],
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();

    ref.setValue([1, 2]);
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 2, 'abc']);
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 2, 3]);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
  });

  it('additionalItems test 5', async () => {
    const model = new Model();
    await model.init(
      {
        items: [
          { resolveSchema: () => Promise.resolve({ type: 'integer' }) },
          { type: 'integer' },
        ],
        additionalItems: false,
      },
      [],
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();

    ref.setValue([1, 2]);
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([1, 2, 3]);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state.message).toMatchObject({
      keyword: 'items_overflow',
      description: 'Should not have more than 2 items',
      bindings: { limit: 2 },
    });
  });
});
