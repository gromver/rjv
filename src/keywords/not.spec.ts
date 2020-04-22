declare const describe;
declare const it;
declare const expect;

import Model from '../Model';

describe('not keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        not: {
          type: 'number',
          maximum: 5,
        },
      },
      6,
    );
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue(4);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue('abc');
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBe(true);
  });

  it('Should expose error', async () => {
    await expect(() => new Model(
      {
        // @ts-ignore
        not: 1,
      },
      '',
    ))
      .toThrow('The value of the "not" keyword should be a schema object.');
  });
});
