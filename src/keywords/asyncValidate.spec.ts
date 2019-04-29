declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('asyncValidate keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        asyncValidate: (ref) => {
          return Promise.resolve().then(() => {
            if (ref.checkDataType('number')) {
              const value = ref.get();

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

    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(5);
    await ref.validate();
    expect(ref.state).toMatchObject({
      type: StateTypes.ERROR,
      message: {
        keyword: 'customFn',
        description: 'Value should be greater than 5.',
      },
    });

    ref.set('string');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Should throw errors', async () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          asyncValidate: {},
        },
        '',
      );
    }).toThrow('The schema of the "asyncValidate" keyword should be an async validation function.');
  });
});
