declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('syncSchema keyword', () => {
  it('Some integration tests', () => {
    const model = new Model(
      {
        properties: {
          expect: {
            enum: ['string', 'number'],
          },
          value: {
            syncSchema: (ref) => {
              const expect = ref.absoluteRef(['expect']).get();

              return {
                type: expect,
              };
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

    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    valueRef.set('foo');
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);

    expectRef.set('string');
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);

    valueRef.set(1);
    ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
  });

  it('Check state merging', () => {
    const model = new Model(
      {
        syncSchema: () => ({
          properties: {
            foo: {
              readOnly: true,
            },
          },
        }),
        properties: {
          foo: {
            type: ['string', 'number'],
          },
        },
      },
      {
        foo: 'test',
      },
    );

    const ref = model.ref();
    const fooRef = model.ref(['foo']);
    ref.validate();
    expect(fooRef.state.type).toBe(StateTypes.SUCCESS);
    expect(fooRef.state.readOnly).toBe(true);
  });

  it('Should throw errors', async () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          syncSchema: {},
        },
        '',
      );
    }).toThrow('The schema of the "syncSchema" keyword should be a function returns a schema.');

    const model = new Model(
      {
        // @ts-ignore
        syncSchema: () => ({
          asyncSchema: () => ({}),
        }),
      },
      '',
    );

    expect(() => {
      model.validate();
    }).toThrow('The syncSchema\'s schema can\'t be async.');
  });
});
