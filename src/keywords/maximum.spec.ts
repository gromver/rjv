declare const describe;
declare const it;
declare const expect;

import Model from '../Model';

describe('maximum keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        maximum: 5,
      },
      5,
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue(6);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state.message).toMatchObject({
      keyword: 'maximum',
      description: 'Should be less than or equal 5',
    });

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Some integration tests with exclusive mode', async () => {
    const model = new Model(
      {
        maximum: 5,
        exclusiveMaximum: true,
      },
      4,
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue(5);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state.message).toMatchObject({
      keyword: 'maximum_exclusive',
      description: 'Should be less than 5',
    });
  });

  it('Should expose error', async () => {
    await expect(() => new Model(
      {
        // @ts-ignore
        maximum: '1',
      },
      '',
    ))
      .toThrow('The schema of the "maximum" keyword should be a number.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        maximum: 5,
        exclusiveMaximum: true,
      },
      '',
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.minimum).toBe(undefined);
    expect(ref.state.exclusiveMinimum).toBe(undefined);

    ref.setValue(4);
    await ref.validate();
    expect(ref.state.valid).toBe(true);
    expect(ref.state).toMatchObject({
      maximum: 5,
      exclusiveMaximum: true,
    });

    ref.setValue(6);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state).toMatchObject({
      maximum: 5,
      exclusiveMaximum: true,
    });
  });
});
