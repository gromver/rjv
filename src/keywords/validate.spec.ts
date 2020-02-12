declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

describe('validate keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model();
    await model.init(
      {
        validate: (ref) => {
          return Promise.resolve().then(() => {
            if (ref.checkDataType('number')) {
              const value = ref.getValue();

              if (value > 5) {
                return ref.createSuccessResult();
              }

              return ref.createErrorResult({
                keyword: 'customFn',
                description: 'Value should be greater than 5.',
              });
            }

            return ref.createUndefinedResult();
          });
        },
      },
      10,
    );

    const ref = model.ref();
    expect(ref.state.valid).toBe(true);

    ref.setValue(5);
    await ref.validate();
    expect(ref.state).toMatchObject({
      valid: false,
      message: {
        keyword: 'customFn',
        description: 'Value should be greater than 5.',
      },
    });

    ref.setValue('string');
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Should expose error', async () => {
    const model = new Model();

    await expect(model.init(
      {
        // @ts-ignore
        validate: {},
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The schema of the "validate" keyword should be an async validation function.',
      });
  });
});
