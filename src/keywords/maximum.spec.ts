declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('maximum keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        maximum: 5,
      },
      5,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(6);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(null);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('Some integration tests with exclusive mode', async () => {
    const model = new Model(
      {
        maximum: 5,
        exclusiveMaximum: true,
      },
      4,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(5);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });

  it('Should throw errors', async () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          maximum: '1',
        },
        '',
      );
    }).toThrow('The schema of the "maximum" keyword should be a number.');
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        maximum: 5,
        exclusiveMaximum: true,
      },
      '',
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.minimum).toBe(undefined);
    expect(ref.state.exclusiveMinimum).toBe(undefined);

    ref.set(4);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);
    expect(ref.state).toMatchObject({
      maximum: 5,
      exclusiveMaximum: true,
    });

    ref.set(6);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    expect(ref.state).toMatchObject({
      maximum: 5,
      exclusiveMaximum: true,
    });
  });
});
