import IRule from './interfaces/IRule';

declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from './Model';
import Ref from './Ref';
import { StateTypes } from './interfaces/IState';

describe('Model test', () => {
  it('Must correctly change the current attribute\'s state when the value changes', async () => {
    const model = new Model(
      {
        type: 'number',
      },
      'not a number',
    );

    const ref = model.ref();

    await ref.validate();
    expect(ref.state).toMatchObject({ type: StateTypes.ERROR, message: expect.any(Object) });

    ref.value = 123;

    expect(ref.state.type).toBe(StateTypes.PRISTINE);
    expect(ref.state.message).toBeUndefined();

    await ref.validate();

    expect(ref.state.type).toBe(StateTypes.SUCCESS);
    expect(ref.state.message).toBeUndefined();
  });

  it('Should set default value.', async () => {
    const model = new Model(
      {
        type: 'number',
        default: 123,
      },
      undefined,
    );

    const ref = model.ref();

    const isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.get()).toBe(123);
  });

  it('Should return proper first error', async () => {
    const model = new Model(
      {
        properties: {
          car: { properties: { a: { type: 'number' } } },
          foo: { type: 'number' },
          bar: { properties: { b: { type: 'number' } } },
        },
      },
      {
        car: { a: false },
        foo: false,
        bar: { b: false },
      },
    );

    const ref = model.ref();
    await ref.validate();
    expect((ref.firstError as any).path).toMatchObject(['car', 'a']);
  });

  it('Should expose metadata', async () => {
    const model = new Model(
      {
        title: 'title',
        description: 'description',
        writeOnly: true,
        readOnly: true,
      },
      '',
    );

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
    expect(ref.state).toMatchObject({
      title: 'title',
      description: 'description',
      writeOnly: true,
      readOnly: true,
    });
  });

  it('OnlyDirtyRefs test', async () => {
    const model = new Model(
      {
        properties: {
          a: { type: 'number', maximum: 5 },
          b: { type: 'number', maximum: 5 },
          c: { type: 'number', maximum: 5 },
        },
      },
      {
        a: 6,
        b: 7,
        c: 8,
      },
    );

    const ref = model.ref();
    const refA = model.ref(['a']);
    const refB = model.ref(['b']);
    const refC = model.ref(['c']);
    let isValid = await ref.validate({
      onlyDirtyRefs: true,
    });
    expect(isValid).toBe(false);
    expect(refA.state.type).toBe(StateTypes.PRISTINE);
    expect(refB.state.type).toBe(StateTypes.PRISTINE);
    expect(refC.state.type).toBe(StateTypes.PRISTINE);

    refC.set(1);
    isValid = await ref.validate({
      onlyDirtyRefs: true,
    });
    expect(isValid).toBe(false);
    expect(refA.state.type).toBe(StateTypes.PRISTINE);
    expect(refB.state.type).toBe(StateTypes.PRISTINE);
    expect(refC.state.type).toBe(StateTypes.SUCCESS);

    refB.set(6);
    isValid = await ref.validate({
      onlyDirtyRefs: true,
    });
    expect(isValid).toBe(false);
    expect(refA.state.type).toBe(StateTypes.PRISTINE);
    expect(refB.state.type).toBe(StateTypes.ERROR);
    expect(refC.state.type).toBe(StateTypes.SUCCESS);
  });

  it('clearStateOnSet=true test', async () => {
    const model = new Model(
      {
        type: 'string',
      },
      'foo',
      {
        clearStateOnSet: true,
      },
    );

    const ref = model.ref();
    await model.validate();

    expect(ref.state.type).toBe(StateTypes.SUCCESS);
    ref.value = 'bar';
    expect(ref.state.type).toBe(StateTypes.PRISTINE);
  });

  it('clearStateOnSet=false test', async () => {
    const model = new Model(
      {
        type: 'string',
      },
      'foo',
      {
        clearStateOnSet: false,
      },
    );

    const ref = model.ref();
    await model.validate();

    expect(ref.state.type).toBe(StateTypes.SUCCESS);
    ref.value = 'bar';
    expect(ref.state.type).toBe(StateTypes.SUCCESS);
  });

  it('Test Model::clearAttributeStates()', async () => {
    const model = new Model(
      {
        properties: {
          foo: { type: 'string' },
          bar: {
            properties: {
              baz: { type: 'string' },
            },
          },
        },
      },
      {
        foo: 'abc',
        bar: {
          baz: 'abc',
        },
      },
      {
        clearStateOnSet: false,
      },
    );

    await model.validate();

    let keys = Object.keys(model.states);
    expect(keys).toMatchObject(['[]', '["foo"]', '["bar"]', '["bar","baz"]']);

    model.clearAttributeStates(['bar']);
    keys = Object.keys(model.states);
    expect(keys).toMatchObject(['[]', '["foo"]', '["bar"]']);

    model.clearAttributeStates([]);
    keys = Object.keys(model.states);
    expect(keys).toMatchObject(['[]']);
  });

  it('Test default keyword', async () => {
    const schema = {
      properties: {
        foo: { default: 'foo' },
        bar: { default: 'bar' },
      },
    };
    const expectedObject = {
      foo: 'foo',
      bar: 'bar',
    };

    const m1 = new Model(schema, {});
    await m1.prepare();
    expect(m1.ref().get()).toMatchObject(expectedObject);

    const m2 = new Model(schema, {});
    await m2.prepare();
    expect(m2.ref().get()).toMatchObject(expectedObject);
  });

  it('Test default keyword validation priority', async () => {
    const schema = {
      properties: {
        foo: { default: 'foo', type: 'string', minLength: 1 },
      },
    };

    const m1 = new Model(schema, {});
    await m1.ref().validate();
    expect(m1.ref().state.type).toBe(StateTypes.SUCCESS);
  });

  it('Test filter keyword', async () => {
    const schema = {
      filter: (v) => v.trim(),
    };

    const model = new Model(schema, ' foo  ');
    await model.prepare();
    expect(model.ref().get()).toBe('foo');
  });

  it('Should throw an error', () => {
    expect(() => {
      new Model(
        {
          // @ts-ignore
          filter: '',
        },
        '',
      );
    }).toThrow('The schema of the "filter" keyword should be a function.');
  });

  it('Test error keyword', async () => {
    const model = new Model(
      {
        minLength: 1,
        error: 'Value can\'t be blank.',
      },
      '',
    );
    await model.ref().validate();
    // @ts-ignore
    expect(model.ref().state.message.description).toBe('Value can\'t be blank.');
  });

  it('Test warning keyword 1', async () => {
    const model = new Model(
      {
        minLength: 1,
        warning: 'Warning text',
      },
      'a',
    );
    await model.ref().validate();
    // @ts-ignore
    expect(model.ref().state.message).toBe(undefined);
  });

  it('Test warning keyword 2', async () => {
    const validator = async (ref: Ref) => ref.createSuccessResult({
      keyword: 'custom',
      description: 'Validator\'s warning message.',
    });

    const m1 = new Model(
      {
        validate: validator,
      },
      '',
    );

    await m1.ref().validate();
    // @ts-ignore
    expect(m1.ref().state.message.description).toBe('Validator\'s warning message.');

    const m2 = new Model(
      {
        validate: validator,
        warning: 'Custom warning message.',
      },
      '',
    );

    await m2.ref().validate();
    // @ts-ignore
    expect(m2.ref().state.message.description).toBe('Custom warning message.');
  });

  it('Test keywords option', async () => {
    const model = new Model(
      {
        // @ts-ignore
        newKeyword: true,
      },
      '',
      {
        keywords: [
          {
            name: 'newKeyword',
            compile(): IRule {
              return {
                validate: async (ref) => (ref.createSuccessResult({
                  keyword: 'newKeyword',
                  description: 'Ok',
                })),
              };
            },
          },
        ],
      },
    );
    const ref = model.ref();
    await ref.validate();

    expect(ref.state.type).toBe(StateTypes.SUCCESS);
    expect(ref.state.message).toMatchObject({
      keyword: 'newKeyword',
      description: 'Ok',
    });
  });

  it('Test model\'s errors option', async () => {
    const model = new Model(
      {
        properties: {
          foo: {
            presence: true,
          },
        },
      },
      {
        foo: '',
      },
      {
        errors: {
          presence: 'Custom error message',
        },
      },
    );
    await model.ref().validate();
    const ref = model.ref(['foo']);

    expect(ref.state.message).toMatchObject({
      description: 'Custom error message',
    });
  });

  it('Test model\'s warnings option', async () => {
    const model = new Model(
      {
        // @ts-ignore
        validate: async (ref) => ref.createSuccessResult({
          keyword: 'customValidation',
          description: 'default warning',
        }),
      },
      {},
      {
        warnings: {
          customValidation: 'Custom warning message',
        },
      },
    );
    await model.ref().validate();
    const ref = model.ref();

    expect(ref.state.message).toMatchObject({
      keyword: 'customValidation',
      description: 'Custom warning message',
    });
  });

  it('Test schema\'s errors keyword', async () => {
    const model = new Model(
      {
        properties: {
          foo: {
            presence: true,
            errors: {
              presence: 'schema\'s custom error message',
            },
          },
        },
      },
      {
        foo: '',
      },
      {
        errors: {
          presence: 'model\'s custom error message',
        },
      },
    );
    await model.ref().validate();
    const fooRef = model.ref(['foo']);

    expect(fooRef.state.message).toMatchObject({
      description: 'schema\'s custom error message',
    });
  });

  it('Test schema\'s warnings keyword', async () => {
    const model = new Model(
      {
        // @ts-ignore
        validate: async (ref) => ref.createSuccessResult({
          keyword: 'customValidation',
          description: 'default warning',
        }),
        warnings: {
          customValidation: 'schema\'s custom warning message',
        },
      },
      {},
      {
        warnings: {
          customValidation: 'model\'s custom warning message',
        },
      },
    );
    const ref = model.ref();
    await ref.validate();

    expect(ref.state.message).toMatchObject({
      keyword: 'customValidation',
      description: 'schema\'s custom warning message',
    });
  });

  it('Test async flow', async () => {
    const model = new Model(
      {
        type: 'string',
        title: 'test',
        validate: (ref) => {
          return new Promise((res) => {
            setTimeout(res, 0, ref.createSuccessResult());
          });
        },
      },
      'foo',
    );

    const fn = jest.fn();
    model.observable.subscribe(fn);
    model.ref().value = 'bar';
    await model.ref().validate();

    expect(fn).toHaveBeenCalledTimes(3); // set => validating => success
  });

  it('Should properly validate nested refs', async () => {
    const model = new Model(
      {
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
          c: { type: 'string' },
        },
      },
      {
        a: 'str',
        b: 123,
        c: 123,
      },
    );

    const ref = model.ref();
    const bRef = model.ref(['b']);
    const cRef = model.ref(['c']);

    await ref.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    expect(bRef.state.type).toBe(StateTypes.ERROR);
    expect(cRef.state.type).toBe(StateTypes.ERROR);

    bRef.value = 'str';
    await bRef.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    expect(bRef.state.type).toBe(StateTypes.SUCCESS);
    expect(cRef.state.type).toBe(StateTypes.ERROR);

    cRef.value = 'str';
    await cRef.validate();
    expect(ref.state.type).toBe(StateTypes.ERROR);
    expect(bRef.state.type).toBe(StateTypes.SUCCESS);
    expect(cRef.state.type).toBe(StateTypes.SUCCESS);
  });
});
