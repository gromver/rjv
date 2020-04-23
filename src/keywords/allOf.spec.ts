declare const describe;
declare const it;
declare const expect;

import Model from '../Model';

describe('allOf keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        allOf: [
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
    await model.prepare();

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
  });

  it('Properties integration tests', async () => {
    const model = new Model(
      {
        allOf: [
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
    await model.prepare();

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

  it('Should expose error #1', async () => {
    await expect(() => new Model(
      {
        // @ts-ignore
        allOf: 1,
      },
      '',
    ))
      .toThrow('The schema of the "allOf" keyword should be an array of schemas.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Model(
      {
        // @ts-ignore
        allOf: [1],
      },
      '',
    ))
      .toThrow('Items of "allOf" keyword should be a schema object.');
  });
});
