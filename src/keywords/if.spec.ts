declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('if keyword', () => {
  // todo test async flow
  it('Some integration tests', () => {
    const model = new Model(
      {
        if: {
          type: 'number',
          maximum: 5,
        },
        then: {
          type: 'integer',
        },
        else: {
          type: 'number',
        },
      },
      5,
    );

    const ref = model.ref();
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(4.5);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(6);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set('abc');
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(null);
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });

  it('Properties integration tests', () => {
    const model = new Model(
      {
        if: {
          properties: {
            power: { minimum: 9000 },
          },
        },
        then: { required: ['disbelief'] },
        else: { required: ['confidence'] },
      },
      { power: 10000, disbelief: true },
    );

    const ref = model.ref();
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set({ power: 1000, confidence: true });
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set({});
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);

    ref.set({ power: 10000 });
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set({ power: 10000, confidence: true });
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set({ power: 1000 });
    ref.validateSync();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });

  it('Should throw errors', async () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          if: 1,
        },
        '',
      );
    }).toThrow('The value of the "if" keyword should be a schema object.');

    expect(() => {
      new Model(
        {
          if: {},
        },
        '',
      );
    }).toThrow('For the "if" keyword You must specify at least the keyword "then" or "else".');
  });
});
