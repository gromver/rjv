declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

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

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(4);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set('abc');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(null);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);
  });

  it('Should throw errors', async () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          not: 1,
        },
        '',
      );
    }).toThrow('The value of the "not" keyword should be a schema object.');
  });
});
