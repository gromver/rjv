declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import Ref from '../Ref';

describe('resolveSchema keyword', () => {
  it('Some integration tests', async () => {
    const model = new Model();
    await model.init(
      {
        properties: {
          expect: {
            enum: ['string', 'number'],
          },
          value: {
            resolveSchema: (ref) => {
              const expect = ref.ref('/expect').getValue();

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
    const expectRef = model.ref('expect');
    const valueRef = model.ref('value');

    await ref.validate();
    expect(ref.state.valid).toBe(true);

    valueRef.setValue('foo');
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    expectRef.setValue('string');
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    valueRef.setValue(1);
    await ref.validate();
    expect(ref.state.valid).toBe(false);
  });

  it('Check state merging', async () => {
    const model = new Model();
    await model.init(
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
    const fooRef = model.ref('foo');
    await ref.validate();
    expect(fooRef.state.valid).toBe(true);
    expect(fooRef.state.readOnly).toBe(true);
  });

  it('Should expose error', async () => {
    const model = new Model();

    await expect(model.init(
      {
        // @ts-ignore
        resolveSchema: {},
      },
      '',
    ))
      .rejects
      .toMatchObject({
        message: 'The schema of the "resolveSchema" keyword should be a function returns a schema.',
      });
  });

  it('Should get error description specified in resolveSchema', async () => {
    const CUSTOM_MESSAGE = 'Custom error message';

    const model = new Model();
    await model.init(
      {
        resolveSchema: async () => ({
          presence: true,
          const: 'abc',
          errors: {
            const: CUSTOM_MESSAGE,
          },
        }),
      },
      'a',
    );

    await model.validate();
    const state = (model.ref().firstError as Ref).state;

    expect(state && state.message && state.message.description).toBe(CUSTOM_MESSAGE);
  });

});
