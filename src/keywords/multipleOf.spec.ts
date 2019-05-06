declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('multipleOf keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        multipleOf: 2,
      },
      4,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(4.1);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(null);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Should throw errors', async () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          multipleOf: '1',
        },
        '',
      );
    }).toThrow('The schema of the "multipleOf" keyword should be a number.');

    expect(() => {
      new Model(
        {
          multipleOf: 0,
        },
        '',
      );
    }).toThrow('The "multipleOf" keyword can\'t be zero.');
  });
});
