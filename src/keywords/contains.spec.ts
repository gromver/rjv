declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

describe('contains keyword', () => {
  it('sync test', async () => {
    const model = new Model();
    await model.init(
      {
        contains: {
          type: 'number',
        },
      },
      [1, 'a', null],
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([null, 'test']);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue([]);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('async test', async () => {
    const model = new Model();
    await model.init(
      {
        contains: {
          resolveSchema: () => Promise.resolve({ type: 'number' }),
        },
      },
      [1, 'a', null],
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([null, 'test']);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue([]);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('schema test', async () => {
    const model = new Model();
    await model.init(
      {
        not: {
          type: 'array',
          items: {
            not: { type: 'number' },
          },
        },
      },
      [1, 'a', null],
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue([null, 'test']);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue([]);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBe(true);
  });

  it('Should expose error', async () => {
    const model = new Model();

    await expect(model.init(
      {
        // @ts-ignore
        contains: 1,
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The schema of the "contains" keyword should be a schema object.',
      });
  });
});
