declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('oneOf keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        oneOf: [
          {
            type: 'number',
            maximum: 5,
          },
          {
            type: 'number',
            minimum: 3,
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
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set('abc');
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    ref.set(4);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    ref.set('abcd');
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });

  it('Properties integration tests', async () => {
    const model = new Model(
      {
        oneOf: [
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
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    aRef.set('abc');
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    aRef.set(4);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    aRef.set('ab');
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });

  it('Should throw errors', async () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          oneOf: 1,
        },
        '',
      );
    }).toThrow('The schema of the "oneOf" keyword should be an array of schemas.');

    expect(() => {
      new Model(
        {
          // @ts-ignore
          oneOf: [1],
        },
        '',
      );
    }).toThrow('Items of "oneOf" keyword should be a schema object.');
  });
});
