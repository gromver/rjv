declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('anyOf keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        anyOf: [
          {
            type: 'number',
            maximum: 5,
          },
          {
            type: 'string',
            maxLength: 3,
          },
        ],
      },
      1,
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set('abc');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(6);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set('abcd');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });

  it('Properties integration tests', async () => {
    const model = new Model(
      {
        anyOf: [
          {
            properties: {
              a: {
                type: 'number',
                maximum: 5,
              },
            },
          },
          {
            properties: {
              a: {
                type: 'string',
                minLength: 3,
              },
            },
          },
        ],
      },
      { a: 1 },
    );

    const ref = model.ref();
    const aRef = ref.relativeRef(['a']);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    aRef.set('abc');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    aRef.set(6);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    aRef.set('ab');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });

  it('Should throw errors', async () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          anyOf: 1,
        },
        '',
      );
    }).toThrow('The schema of the "anyOf" keyword should be an array of schemas.');

    expect(() => {
      new Model(
        {
          // @ts-ignore
          anyOf: [1],
        },
        '',
      );
    }).toThrow('Items of "anyOf" keyword should be a schema object.');
  });
});
