declare const jest;
declare const describe;
declare const it;
declare const expect;

import Model from './Model';
import ChangeRefValueEvent from './events/ChangeRefValueEvent';

describe('Ref tests', () => {
  it('Ref\'s getters and setters', async () => {
    const initialData = {
      foo: 'bar',
    };

    const model = new Model(
      {},
      initialData,
    );
    await model.prepare();
    const ref = model.ref();

    expect(ref.getInitialValue()).toBe(ref.getInitialValue());
    expect(ref.getInitialValue()).toMatchObject(initialData);
    expect(ref.getInitialValue()).not.toBe(initialData);

    expect(ref.getValue()).toMatchObject(initialData);
    expect(ref.getValue()).not.toBe(initialData);
    expect(ref.getValue()).not.toBe(ref.getInitialValue());
    expect(ref.getValue()).toBe(ref.getValue());

    ref.setValue(1);
    expect(ref.getValue()).toBe(1);

    ref.setValue(2);
    expect(ref.getValue()).toBe(2);
  });

  it('Ref::set(value) should dispatch ChangeRefValueEvent', async () => {
    const model = new Model(
      { type: 'string' },
      'foo',
    );
    await model.prepare();
    const ref = model.ref();
    const fn = jest.fn();
    model.observable.subscribe(fn);

    ref.setValue('bar');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toBeCalledWith(expect.any(ChangeRefValueEvent));
  });

  it('Ref::value should dispatch ChangeRefValueEvent', async () => {
    const model = new Model(
      { type: 'string' },
      'foo',
    );
    await model.prepare();
    const ref = model.ref();
    const fn = jest.fn();
    model.observable.subscribe(fn);

    ref.setValue('bar');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toBeCalledWith(expect.any(ChangeRefValueEvent));
  });

  it('Ref::state', async () => {
    const model = new Model(
      {
        type: 'number',
        readOnly: true,
        writeOnly: true,
      },
      '',
    );
    await model.prepare();
    const ref = model.ref();
    expect(ref.state).toMatchObject({
      valid: false,
      required: false,
      readOnly: true,
      writeOnly: true,
      message: {
        keyword: 'type',
      },
    });

    await ref.validate();
    expect(ref.state).toMatchObject({
      valid: false,
      required: false,
      readOnly: true,
      writeOnly: true,
      message: {
        keyword: 'type',
      },
    });
  });

  it('Ref::errors', async () => {
    const model = new Model(
      {
        properties: {
          foo: {
            properties: {
              bar: {
                type: 'number',
              },
            },
          },
        },
      },
      {
        foo: {
          bar: 'abc',
        },
      },
    );
    await model.prepare();

    const ref = model.ref();
    expect(ref.errors).toHaveLength(3);

    await ref.validate();
    expect(ref.errors).toHaveLength(3);

    expect(ref.ref('foo').errors).toHaveLength(1);
    expect(ref.ref('foo/bar').errors).toHaveLength(0);
  });

  it('Ref::validatedErrors', async () => {
    const model = new Model(
      {
        properties: {
          foo: {
            properties: {
              bar: {
                type: 'number',
              },
            },
          },
        },
      },
      {
        foo: {
          bar: 'abc',
        },
      },
    );
    await model.prepare();

    const ref = model.ref();
    expect(ref.validatedErrors).toHaveLength(0);

    await ref.validate();
    expect(ref.validatedErrors).toHaveLength(3);

    expect(ref.ref('foo').validatedErrors).toHaveLength(1);
    expect(ref.ref('foo/bar').validatedErrors).toHaveLength(0);
  });

  it('Ref::isChanged', async () => {
    const model = new Model(
      {
        properties: {
          foo: {},
          bar: {},
        },
      },
      {
        foo: 'val',
        bar: 'val',
      },
    );
    await model.prepare();

    const ref = model.ref();
    const fooRef = model.ref('foo');
    const barRef = model.ref('bar');
    expect(ref.isChanged).toBe(false);

    fooRef.setValue('abc');
    expect(ref.isChanged).toBe(true);
    expect(fooRef.isChanged).toBe(true);
    expect(barRef.isChanged).toBe(false);

    fooRef.setValue('val');
    expect(ref.isChanged).toBe(false);
    expect(fooRef.isChanged).toBe(false);
    expect(barRef.isChanged).toBe(false);
  });

  it('Ref::message', async () => {
    const model = new Model(
      { type: 'string' },
      'foo',
    );
    await model.prepare();
    const ref = model.ref();
    expect(ref.message).toBeUndefined();

    await ref.validate();
    expect(ref.message).toBeUndefined();

    ref.setValue(1);
    await ref.validate();
    expect(ref.message).toMatchObject({
      keyword: 'type',
    });
  });

  it('Ref::isDirty', async () => {
    const model = new Model(
      {},
      1,
    );
    await model.prepare();

    const ref = model.ref();
    expect(ref.isDirty).toBe(false);

    ref.setValue(1);
    expect(ref.isDirty).toBe(false);

    ref.markAsDirty();
    expect(ref.isDirty).toBe(true);
  });

  it('Ref::isRequired', async () => {
    const model = new Model(
      {
        required: ['foo'],
      },
      {},
    );
    await model.prepare();

    const ref = model.ref();
    const fooRef = model.ref('foo');
    expect(fooRef.isRequired).toBe(true);
  });

  it('Ref::isMutable, Ref::isReadOnly, Ref::isWriteOnly', async () => {
    const model = new Model(
      {
        readOnly: true,
        writeOnly: true,
      },
      {},
    );
    await model.prepare();

    const ref = model.ref();
    expect(ref.isMutable).toBe(false);
    expect(ref.isReadOnly).toBe(true);
    expect(ref.isWriteOnly).toBe(true);
  });

  it('Ref::isValidated', async () => {
    const model = new Model(
      {},
      1,
    );
    await model.prepare();

    const ref = model.ref();
    expect(ref.isValidated).toBe(false);

    await model.validateRef(ref);
    expect(ref.isValidated).toBe(false);

    await ref.validate();
    expect(ref.isValidated).toBe(true);
  });

  it('Ref::isValid, Ref::isInvalid', async () => {
    const model = new Model(
      {
        type: 'number',
      },
      1,
    );
    await model.prepare();

    const ref = model.ref();
    expect(ref.isValid).toBe(false);
    expect(ref.isInvalid).toBe(false);

    await ref.validate();
    expect(ref.isValid).toBe(true);
    expect(ref.isInvalid).toBe(false);

    ref.setValue('');
    await ref.validate();
    expect(ref.isValid).toBe(false);
    expect(ref.isInvalid).toBe(true);
  });

  it('Ref::isValidating, Ref::isPristine', async () => {
    const model = new Model(
      {
        resolveSchema: () => Promise.resolve({
          type: 'number',
        }),
      },
      1,
    );
    await model.prepare();

    const ref = model.ref();
    expect(ref.isPristine).toBe(true);
    expect(ref.isValidating).toBe(false);

    const fn = jest.fn(() => {
      if (fn.mock.length === 2) {
        expect(ref.isPristine).toBe(false);
        expect(ref.isValidating).toBe(true);
      } else if (fn.mock.length === 3) {
        expect(ref.isPristine).toBe(false);
        expect(ref.isValidating).toBe(false);
        expect(ref.isValid).toBe(true);
      }
    });
    model.observable.subscribe(fn);

    await ref.validate();
  });

  it('Ref::isShouldNotBeBlank', async () => {
    const model = new Model(
      {
        properties: {
          foo: {
            presence: true,
          },
        },
      },
      {},
    );
    await model.prepare();

    const fooRef = model.ref('foo');
    expect(fooRef.isShouldNotBeBlank).toBe(true);
  });

  it('Ref::isTouched, Ref::isUntouched', async () => {
    const model = new Model(
      {},
      {},
    );
    await model.prepare();

    const ref = model.ref();
    expect(ref.isTouched).toBe(false);
    expect(ref.isUntouched).toBe(true);

    ref.markAsTouched();
    expect(ref.isTouched).toBe(true);
    expect(ref.isUntouched).toBe(false);
  });

  it('Ref::touch()', async () => {
    const model = new Model(
      {},
      {},
    );
    await model.prepare();

    const ref = model.ref();
    expect(ref.isTouched).toBe(false);
    expect(ref.isUntouched).toBe(true);

    ref.markAsTouched();
    expect(ref.isTouched).toBe(true);
    expect(ref.isUntouched).toBe(false);
  });

  it('Ref::withTouch()', async () => {
    const model = new Model(
      {},
      {},
    );
    await model.prepare();

    const handler = (input: string): number => {
      return input.length;
    };

    const ref = model.ref();
    expect(ref.isTouched).toBe(false);
    expect(ref.isUntouched).toBe(true);

    const withTouchFn = ref.withTouch(handler);
    expect(withTouchFn('abc')).toBe(3);
    expect(ref.isTouched).toBe(true);
    expect(ref.isUntouched).toBe(false);
  });

  it('Ref::firstError', async () => {
    const model = new Model(
      {
        properties: {
          a: {
            properties: {
              aa: { type: 'number' },
            },
          },
          b: {
            properties: {
              bb: { type: 'number' },
            },
          },
        },
      },
      {
        a: { aa: '' },
        b: { bb: '' },
      },
    );
    await model.prepare();

    const ref = model.ref();
    expect(ref.firstError).toMatchObject({ path: '/a/aa' });
    expect((ref.ref('a').firstError as any).state).toMatchObject({ errLock: 1 });
    expect((ref.ref('b').firstError as any).state).toMatchObject({ errLock: 3 });

    await ref.validate();
    expect(ref.firstError).toMatchObject({ path: '/a/aa' });
    expect((ref.ref('a').firstError as any).state).toMatchObject({ errLock: 6 });
    expect((ref.ref('b').firstError as any).state).toMatchObject({ errLock: 8 });
  });

  it('Ref::validatedFirstError', async () => {
    const model = new Model(
      {
        properties: {
          a: {
            properties: {
              aa: { type: 'number' },
            },
          },
          b: {
            properties: {
              bb: { type: 'number' },
            },
          },
        },
      },
      {
        a: { aa: '' },
        b: { bb: '' },
      },
    );
    await model.prepare();

    const ref = model.ref();
    expect(ref.validatedFirstError).toBeUndefined();

    await ref.validate();
    expect(ref.validatedFirstError).toMatchObject({ path: '/a/aa' });
    expect((ref.ref('a').firstError as any).state).toMatchObject({ errLock: 6 });
    expect((ref.ref('b').firstError as any).state).toMatchObject({ errLock: 8 });
  });

  it('Ref::validate', async () => {
    const model = new Model(
      {
        properties: {
          a: {
            properties: {
              aa: { type: 'number' },
            },
          },
          b: { type: 'number' },
        },
      },
      {
        a: { aa: '' },
        b: '',
      },
    );
    await model.prepare();

    const aaRef = model.ref('a/aa');
    await expect(aaRef.validate()).resolves.toBe(false);
    aaRef.setValue(1);
    await expect(aaRef.validate()).resolves.toBe(true);
  });
});
