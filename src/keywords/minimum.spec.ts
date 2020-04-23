declare const describe;
declare const it;
declare const expect;

import Model from '../Model';

describe('minimum keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        minimum: 5,
      },
      5,
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue(4);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state.message).toMatchObject({
      keyword: 'minimum',
      description: 'Should be greater than or equal 5',
    });

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Some integration tests with exclusive mode', async () => {
    const model = new Model(
      {
        minimum: 5,
        exclusiveMinimum: true,
      },
      6,
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue(5);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state.message).toMatchObject({
      keyword: 'minimum_exclusive',
      description: 'Should be greater than 5',
    });
  });

  it('Should expose error', async () => {
    await expect(() => new Model(
      {
        // @ts-ignore
        minimum: '1',
      },
      '',
    ))
      .toThrow('The schema of the "minimum" keyword should be a number.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        minimum: 5,
        exclusiveMinimum: true,
      },
      '',
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.minimum).toBe(undefined);
    expect(ref.state.exclusiveMinimum).toBe(undefined);

    ref.setValue(6);
    await ref.validate();
    expect(ref.state.valid).toBe(true);
    expect(ref.state).toMatchObject({
      minimum: 5,
      exclusiveMinimum: true,
    });

    ref.setValue(4);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state).toMatchObject({
      minimum: 5,
      exclusiveMinimum: true,
    });
  });
});
