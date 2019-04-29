declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('syncValidate keyword', () => {
  it('Some integration tests', () => {
    const model = new Model(
      {
        syncValidate: (ref) => {
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
        },
      },
      10,
    );

    const ref = model.ref();

    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(5);
    ref.validate();
    expect(ref.state).toMatchObject({
      type: StateTypes.ERROR,
      message: {
        keyword: 'customFn',
        description: 'Value should be greater than 5.',
      },
    });

    ref.set('string');
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Should throw errors', async () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          syncValidate: {},
        },
        '',
      );
    }).toThrow('The schema of the "syncValidate" keyword should be a sync validation function.');
  });
});
