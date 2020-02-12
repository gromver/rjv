declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

describe('multipleOf keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model();
    await model.init(
      {
        multipleOf: 2,
      },
      4,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue(4.1);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(null);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Should expose error 1', async () => {
    const model = new Model();

    await expect(model.init(
      {
        // @ts-ignore
        multipleOf: '1',
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The schema of the "multipleOf" keyword should be a number.',
      });
  });

  it('Should expose error 2', async () => {
    const model = new Model();

    await expect(model.init(
      {
        multipleOf: 0,
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The "multipleOf" keyword can\'t be zero.',
      });
  });
});
