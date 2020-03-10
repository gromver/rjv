declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

describe('not keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model();
    await model.init(
      {
        not: {
          type: 'number',
          maximum: 5,
        },
      },
      6,
    );

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
    const model = new Model();

    await expect(model.init(
      {
        // @ts-ignore
        not: 1,
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The value of the "not" keyword should be a schema object.',
      });
  });
});
