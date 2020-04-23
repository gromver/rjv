declare const jest;
declare const describe;
declare const it;
declare const expect;

import Model from './Model';
import Ref from './Ref';
import { IRule } from './types';

describe('Model test', () => {
  it('Must correctly change the current attribute\'s state when the value changes', async () => {
    const model = new Model(
      {
        type: 'number',
      },
      'not a number',
    );
    await model.prepare();

    const ref = model.ref();

    await ref.validate();
    expect(ref.state).toMatchObject({ valid: false, message: expect.any(Object) });

    ref.setValue(123);
    ref.markAsChanged();

    expect(ref.state.valid).toBeUndefined();
    expect(ref.state.message).toBeUndefined();

    await ref.validate();

    expect(ref.state.valid).toBe(true);
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
    await model.prepare();

    const ref = model.ref();

    const isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe(123);
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
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect((ref.firstError as any).path).toBe('/car/a');
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
    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
    expect(ref.state).toMatchObject({
      title: 'title',
      description: 'description',
      writeOnly: true,
      readOnly: true,
    });
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
    expect(m1.ref().getValue()).toMatchObject(expectedObject);

    const m2 = new Model(schema, {});
    await m2.prepare();
    expect(m2.ref().getValue()).toMatchObject(expectedObject);
  });

  it('Test default keyword validation priority', async () => {
    const schema = {
      properties: {
        foo: { default: 'foo', type: 'string', minLength: 1 },
      },
    };

    const model = new Model(schema, {});
    await model.prepare();
    const isValid = await model.ref().validate();
    expect(isValid).toBe(true);
    expect(model.ref().state.valid).toBe(true);
  });

  it('Test filter keyword', async () => {
    const schema = {
      filter: (v) => v.trim(),
    };

    const model = new Model(schema, ' foo  ');
    await model.prepare();
    expect(model.ref().getValue()).toBe('foo');
  });

  it('Should expose an error', async () => {
    await expect(() => new Model(
      {
        // @ts-ignore
        filter: '',
      },
      '',
    ))
      .toThrow('The schema of the "filter" keyword should be a function.');
  });

  it('Test error keyword', async () => {
    const model = new Model(
      {
        minLength: 1,
        error: 'Value can\'t be blank.',
      },
      '',
    );
    await model.prepare();
    await model.ref().validate();
    // @ts-ignore
    expect(model.ref().state.message.description).toBe('Value can\'t be blank.');
  });

  it('Test warning keyword #1', async () => {
    const model = new Model(
      {
        minLength: 1,
        warning: 'Warning text',
      },
      'a',
    );
    await model.prepare();
    await model.ref().validate();
    // @ts-ignore
    expect(model.ref().state.message).toBe(undefined);
  });

  it('Test warning keyword #2', async () => {
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
    await m1.prepare();

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
    await m2.prepare();

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
        validation: {
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
      },
    );
    await model.prepare();
    const ref = model.ref();
    await ref.validate();

    expect(ref.state.valid).toBe(true);
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
        validation: {
          errors: {
            presence: 'Custom error message',
          },
        },
      },
    );
    await model.prepare();
    await model.ref().validate();
    const ref = model.ref('foo');

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
        validation: {
          warnings: {
            customValidation: 'Custom warning message',
          },
        },
      },
    );
    await model.prepare();
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
        validation: {
          errors: {
            presence: 'model\'s custom error message',
          },
        },
      },
    );
    await model.prepare();
    await model.ref().validate();
    const fooRef = model.ref('foo');

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
        validation: {
          warnings: {
            customValidation: 'model\'s custom warning message',
          },
        },
      },
    );
    await model.prepare();
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
    await model.prepare();

    const fn = jest.fn();
    model.observable.subscribe(fn);
    model.ref().setValue('bar');
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
    await model.prepare();

    const ref = model.ref();
    const bRef = model.ref('b');
    const cRef = model.ref('c');

    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(bRef.state.valid).toBe(false);
    expect(cRef.state.valid).toBe(false);

    bRef.setValue('str');
    await bRef.validate();
    expect(ref.state.valid).toBe(false);
    expect(bRef.state.valid).toBe(true);
    expect(cRef.state.valid).toBe(false);

    cRef.setValue('str');
    await cRef.validate();
    expect(ref.state.valid).toBe(false);
    expect(bRef.state.valid).toBe(true);
    expect(cRef.state.valid).toBe(true);
  });

  it('Test errLock property', async () => {
    const model = new Model(
      {
        properties: {
          prop: { type: 'string', minLength: 2 },
        },
      },
      {
        prop: 123,
      },
    );
    await model.prepare();

    const ref = model.ref();
    const propRef = model.ref('prop');

    expect(ref.state.valid).toBe(false);
    expect(ref.isValidated).toBe(false);
    expect(ref.state.errLock).toBe(2);
    expect(propRef.state.valid).toBe(false);
    expect(propRef.state.errLock).toBe(1);

    await propRef.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.isValidated).toBe(false);
    expect(ref.state.errLock).toBe(2);
    expect(propRef.state.valid).toBe(false);
    expect(propRef.state.errLock).toBe(3);
  });

  it('Test ref\'s tree rebuilding after validation 1', async () => {
    const model = new Model(
      {
        properties: {
          case: { enum: [1, 2] },
        },
        if: {
          properties: {
            case: { const: 1 },
          },
        },
        then: {
          properties: {
            a: { type: 'string', presence: true },
          },
        },
        else: {
          properties: {
            b: { type: 'string', presence: true },
          },
        },
      },
      {
        case: 1,
        a: 'a',
        b: 'b',
      },
    );
    await model.prepare();

    expect(model.safeRef('a')).toBeInstanceOf(Ref);
    expect(model.safeRef('b')).toBeUndefined();

    model.ref('case').setValue(2);
    await model.validate();
    expect(model.safeRef('a')).toBeUndefined();
    expect(model.safeRef('b')).toBeInstanceOf(Ref);
  });

  it('Test ref\'s tree rebuilding after validation 2', async () => {
    const model = new Model(
      {
        properties: {
          case: { enum: [1, 2], dependencies: ['../a', '../b'] },
        },
        if: {
          properties: {
            case: { const: 1 },
          },
        },
        then: {
          properties: {
            a: { type: 'string', presence: true },
          },
        },
        else: {
          properties: {
            b: { type: 'string', presence: true },
          },
        },
      },
      {
        case: 1,
        a: 'a',
        b: 'b',
      },
    );
    await model.prepare();

    expect(model.safeRef('a')).toBeInstanceOf(Ref);
    expect(model.safeRef('b')).toBeUndefined();

    const caseRef = model.ref('case');
    caseRef.setValue(2);
    await caseRef.validate();
    expect(model.safeRef('a')).toBeUndefined();
    expect(model.safeRef('b')).toBeInstanceOf(Ref);
  });

  it('Test dependencies keyword', async () => {
    const model = new Model(
      {
        properties: {
          case: {
            enum: [1, 2],
            dependencies: ['/a', '/b'],
          },
        },
        if: {
          properties: {
            case: { const: 1 },
          },
        },
        then: {
          properties: {
            a: { type: 'string', presence: true },
          },
        },
        else: {
          properties: {
            b: { type: 'string', presence: true },
          },
        },
      },
      {
        case: 1,
        a: 'a',
        b: 'b',
      },
    );
    await model.prepare();

    expect(model.safeRef('a')).toBeInstanceOf(Ref);
    expect((model.safeRef('a') as Ref).isValidated).toBe(false);
    expect(model.safeRef('b')).toBeUndefined();

    const caseRef = model.safeRef('case') as Ref;
    caseRef.setValue(2);
    await caseRef.validate();
    expect(model.safeRef('a')).toBeUndefined();
    expect(model.safeRef('b')).toBeInstanceOf(Ref);
    expect((model.safeRef('b') as Ref).isValidated).toBe(false);
  });

  it('Test dependsOn keyword', async () => {
    const model = new Model(
      {
        properties: {
          case: { enum: [1, 2] },
          a: { dependsOn: ['/case'] },
          b: { dependsOn: ['../case'] },
        },
        if: {
          properties: {
            case: { const: 1 },
          },
        },
        then: {
          properties: {
            a: { type: 'string', presence: true },
          },
        },
        else: {
          properties: {
            b: { type: 'string', presence: true },
          },
        },
      },
      {
        case: 1,
        a: 'a',
        b: 'b',
      },
    );
    await model.prepare();

    expect(model.safeRef('a')).toBeInstanceOf(Ref);
    expect((model.safeRef('a') as Ref).state.valid).toBe(true);
    expect((model.safeRef('a') as Ref).isValidated).toBe(false);
    expect(model.safeRef('b')).toBeInstanceOf(Ref);
    expect((model.safeRef('b') as Ref).state.valid).toBeUndefined();
    expect((model.safeRef('b') as Ref).isValidated).toBe(false);

    const caseRef = model.ref('case') as Ref;
    caseRef.setValue(2);
    await caseRef.validate();
    expect((model.safeRef('a') as Ref).state.valid).toBeUndefined();
    expect((model.safeRef('a') as Ref).isValidated).toBe(false);
    expect((model.safeRef('b') as Ref).state.valid).toBe(true);
    expect((model.safeRef('b') as Ref).isValidated).toBe(false);
  });

  it('Test model::setRefState', async () => {
    const model = new Model(
      {
        type: 'string',
      },
      1,
    );
    const fn = jest.fn();
    model.observable.subscribe(fn);

    await model.prepare();

    const ref = model.ref();
    await ref.validate();
    expect(ref.isValid).toBe(false);
    expect(fn.mock.calls[0][0]).toMatchObject({ path: '/' });
    expect(fn.mock.calls[1][0]).toMatchObject({ path: '/' });
  });

  it('Should return a cloned version of model data', async () => {
    const initialData = { foo: 'bar' };
    const model = new Model({}, initialData);

    await model.prepare();
    expect(model.getAttributes()).toMatchObject(initialData);
    expect(model.getAttributes()).not.toBe(initialData);
    expect(model.attributes).toMatchObject(initialData);
    expect(model.attributes).not.toBe(initialData);
  });
});
