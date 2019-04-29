declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import { StateTypes } from '../interfaces/IState';

describe('asyncSchema keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model(
      {
        properties: {
          expect: {
            enum: ['string', 'number'],
          },
          value: {
            asyncSchema: (ref) => {
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
        asyncSchema: () => Promise.resolve({
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

  it('Test that order of async validation acts like sync validation 1', async () => {
    const model = new Model(
      {
        asyncValidate: () => {
          return new Promise((r) => setTimeout(r, 10, ref.createSuccessResult(
            undefined,
            {
              customMetaData: 'test',
            },
          )));
        },
        syncValidate: (ref) => {
          if ((ref.state as any).customMetaData === 'test') {
            return ref.createSuccessResult();
          }

          return ref.createErrorResult({
            keyword: 'orderValidation',
            description: 'Test is not passed.',
          });
        },
      },
      {
        foo: '',
      },
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.SUCCESS);
    expect((ref.state as any).customMetaData).toBe('test');
  });

  it('Test that order of async validation acts like sync validation 2', async () => {
    const model = new Model(
      {
        allOf: [
          {
            properties: {
              foo: {
                asyncValidate: () => {
                  return new Promise((r) => setTimeout(r, 10, ref.createSuccessResult(
                    undefined,
                    {
                      customMetaData: 'test',
                    },
                  )));
                },
              },
            },
          },
          {
            properties: {
              foo: {
                syncValidate: (ref) => {
                  if ((ref.state as any).customMetaData === 'test') {
                    return ref.createSuccessResult();
                  }

                  return ref.createErrorResult({
                    keyword: 'orderValidation',
                    description: 'Test is not passed.',
                  });
                },
              },
            },
          },
        ],
      },
      {
        foo: '',
      },
    );

    const ref = model.ref();
    const fooRef = model.ref(['foo']);
    await ref.validate();
    expect(fooRef.state.type).toBe(StateTypes.SUCCESS);
    expect((fooRef.state as any).customMetaData).toBe('test');
  });

  it('Should throw errors', async () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          asyncSchema: {},
        },
        '',
      );
    }).toThrow('The schema of the "asyncSchema" keyword should be a function returns a schema.');
  });
});
