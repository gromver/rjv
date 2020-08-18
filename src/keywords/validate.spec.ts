declare const describe;
declare const it;
declare const expect;

import Model from '../Model';
import ValidationMessage from '../ValidationMessage';

describe('validate keyword', () => {
  it('Should work with async validation function', async () => {
    const model = new Model(
      {
        validate: (ref) => {
          return Promise.resolve().then(() => {
            if (ref.checkDataType('number')) {
              const value = ref.getValue();

              if (value > 5) {
                return ref.createSuccessResult();
              }

              return ref.createErrorResult(new ValidationMessage(
                'customFn',
                'Value should be greater than 5.',
              ));
            }

            return ref.createUndefinedResult();
          });
        },
      },
      10,
    );
    await model.prepare();

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

  it('Should work with sync validation function', async () => {
    const model = new Model(
      {
        validate: (ref) => {
          if (ref.checkDataType('number')) {
            const value = ref.getValue();

            if (value > 5) {
              return ref.createSuccessResult();
            }

            return ref.createErrorResult(new ValidationMessage(
              'customFn',
              'Value should be greater than 5.',
            ));
          }

          return ref.createUndefinedResult();
        },
      },
      10,
    );
    await model.prepare();

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
    await expect(() => new Model(
      {
        // @ts-ignore
        validate: {},
      },
      '',
    ))
      .toThrow('The schema of the "validate" keyword should be an async validation function.');
  });
});
