declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('allOf keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        allOf: [
          {
            type: 'number',
            maximum: 5,
          },
          {
            type: 'number',
            minimum: 3,
          },
        ],
      },
      3,
    );

    const ref = model.ref();
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(1);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set('abc');
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set(null);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });

  it('Properties integration tests', async () => {
    const model = new Model(
      {
        allOf: [
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
                type: 'number',
                minimum: 3,
              },
            },
          },
        ],
      },
      { a: 4 },
    );

    const ref = model.ref();
    const aRef = ref.relativeRef(['a']);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    aRef.set(1);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    aRef.set('abc');
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    aRef.set(null);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });

  it('Should throw errors', async () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          allOf: 1,
        },
        '',
      );
    }).toThrow('The schema of the "allOf" keyword should be an array of schemas.');

    expect(() => {
      new Model(
        {
          // @ts-ignore
          allOf: [1],
        },
        '',
      );
    }).toThrow('Items of "allOf" keyword should be a schema object.');
  });
});
