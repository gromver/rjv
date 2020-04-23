declare const describe;
declare const it;
declare const expect;

import Model from '../Model';

describe('contains keyword', () => {
  it('sync test', async () => {
    const model = new Model(
      {
        contains: {
          type: 'number',
        },
      },
      [1, 'a', null],
    );
    await model.prepare();

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
    const model = new Model(
      {
        contains: {
          resolveSchema: () => Promise.resolve({ type: 'number' }),
        },
      },
      [1, 'a', null],
    );
    await model.prepare();

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
    const model = new Model(
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
    await model.prepare();

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
    await expect(() => new Model(
      {
        // @ts-ignore
        contains: 1,
      },
      '',
    ))
      .toThrow('The schema of the "contains" keyword should be a schema object.');
  });
});
