declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('resolveSchema keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        properties: {
          expect: {
            enum: ['string', 'number'],
          },
          value: {
            resolveSchema: (ref) => {
              const expect = ref.absoluteRef(['expect']).get();

              return Promise.resolve({
                type: expect,
              });
            },
          },
        },
      },
      {
        expect: 'number',
        value: 1,
      },
    );

    const ref = model.ref();
    const expectRef = model.ref(['expect']);
    const valueRef = model.ref(['value']);

    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    valueRef.set('foo');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    expectRef.set('string');
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    valueRef.set(1);
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });

  it('Check state merging', async () => {
    const model = new Model(
      {
        resolveSchema: () => Promise.resolve({
          properties: {
            foo: {
              readOnly: true,
            },
          },
        }),
        properties: {
          foo: {
            type: 'string',
          },
        },
      },
      {
        foo: 'test',
      },
    );

    const ref = model.ref();
    const fooRef = model.ref(['foo']);
    await ref.validate();
    expect(fooRef.state.type).toBe(StateTypes.SUCCESS);
    expect(fooRef.state.readOnly).toBe(true);
  });

  it('Should throw errors', async () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          resolveSchema: {},
        },
        '',
      );
    }).toThrow('The schema of the "resolveSchema" keyword should be a function returns a schema.');
  });
});
