declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from './Model';
import Ref from './Ref';
import { StateTypes } from './interfaces/IState';

describe('Ref tests', () => {
  it('Should properly validate nested refs.', () => {
    const model = new Model(
      {
        required: ['foo', 'bar'],
        properties: {
          foo: { type: 'number' },
          bar: { type: 'number' },
        },
      },
      {
        foo: 'test',
      },
    );

    const fooRef = model.ref(['foo']);
    const barRef = model.ref(['bar']);

    let result = model.validateSync();
    expect(result.valid).toBe(false);
    expect((result.firstErrorRef as Ref).state).toMatchObject({
      type: StateTypes.ERROR,
      message: {
        keyword: 'required',
      },
    });
    expect((result.firstErrorRef as Ref).path).toMatchObject([]);

    expect(model.ref().isRequired).toBe(false);
    expect(fooRef.isRequired).toBe(true);
    expect(barRef.isRequired).toBe(true);

    fooRef.set(1);
    barRef.set(1);
    result = model.validateSync();
    expect(result.valid).toBe(true);
  });

  it('Ref\'s getters and setters', () => {
    const initialData = {
      foo: 'bar',
    };

    const model = new Model(
      {},
      initialData,
    );
    const ref = model.ref();

    expect(ref.getInitialValue()).toBe(ref.initialValue);
    expect(ref.initialValue).toMatchObject(initialData);
    expect(ref.initialValue).not.toBe(initialData);

    expect(ref.get()).toMatchObject(initialData);
    expect(ref.get()).not.toBe(initialData);
    expect(ref.get()).not.toBe(ref.initialValue);
    expect(ref.get()).toBe(ref.value);

    ref.set(1);
    expect(ref.get()).toBe(1);

    ref.value = 2;
    expect(ref.value).toBe(2);
  });

  it('Ref::parent()', () => {
    const initialData = {
      foo: {
        bar: 'abc',
      },
    };

    const model = new Model(
      {},
      initialData,
    );
    const barRef = model.ref(['foo', 'bar']);
    const barParent: Ref = barRef.parent as Ref;
    const fooParent: Ref = barParent.parent as Ref;

    expect(barParent.path).toMatchObject(['foo']);
    expect(barParent.value).toMatchObject(initialData.foo);

    expect(fooParent.path).toMatchObject([]);
    expect(fooParent.value).toMatchObject(initialData);

    expect(fooParent).toBe(model.ref());
    expect(fooParent.parent).toBe(undefined);
  });

  it('Ref::state', () => {
    const model = new Model(
      {
        type: 'number',
        readOnly: true,
        writeOnly: true,
      },
      '',
    );
    const ref = model.ref();
    expect(ref.state).toMatchObject({
      type: StateTypes.PRISTINE,
      path: [],
      required: false,
      readOnly: false,
      writeOnly: false,
    });

    ref.validateSync();
    expect(ref.state).toMatchObject({
      type: StateTypes.ERROR,
      path: [],
      required: false,
      readOnly: true,
      writeOnly: true,
      message: {
        keyword: 'type',
      },
    });
  });

  it('Ref::errors', () => {
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

    const ref = model.ref();
    expect(ref.errors).toHaveLength(0);

    ref.validateSync();
    expect(ref.errors).toHaveLength(3);

    expect(ref.relativeRef(['foo']).errors).toHaveLength(2);
    expect(ref.relativeRef(['foo', 'bar']).errors).toHaveLength(1);
  });

  it('Ref::isChanged', () => {
    const model = new Model(
      {},
      {
        foo: 'val',
        bar: 'val',
      },
    );

    const ref = model.ref();
    const fooRef = model.ref(['foo']);
    const barRef = model.ref(['bar']);
    expect(ref.isChanged).toBe(false);

    fooRef.value = 'abc';
    expect(ref.isChanged).toBe(true);
    expect(fooRef.isChanged).toBe(true);
    expect(barRef.isChanged).toBe(false);

    fooRef.value = 'val';
    expect(ref.isChanged).toBe(false);
    expect(fooRef.isChanged).toBe(false);
    expect(barRef.isChanged).toBe(false);
  });

  it('Ref::isDirty', () => {
    const model = new Model(
      {},
      1,
    );

    const ref = model.ref();
    expect(ref.isDirty).toBe(false);

    ref.value = 1;
    expect(ref.isDirty).toBe(true);
  });

  it('Ref::isRequired', () => {
    const model = new Model(
      {
        required: ['foo'],
      },
      {},
    );

    const ref = model.ref();
    const fooRef = model.ref(['foo']);
    expect(fooRef.isRequired).toBe(false);

    ref.validateSync();
    expect(fooRef.isRequired).toBe(true);
  });

  it('Ref::isMutable, Ref::isReadOnly, Ref::isWriteOnly', () => {
    const model = new Model(
      {
        readOnly: true,
        writeOnly: true,
      },
      {},
    );

    const ref = model.ref();
    expect(ref.isMutable).toBe(true);
    expect(ref.isReadOnly).toBe(false);
    expect(ref.isWriteOnly).toBe(false);

    ref.validateSync();
    expect(ref.isMutable).toBe(false);
    expect(ref.isReadOnly).toBe(true);
    expect(ref.isWriteOnly).toBe(true);
  });

  it('Ref::isValidated', () => {
    const model = new Model(
      {},
      1,
    );

    const ref = model.ref();
    expect(ref.isValidated).toBe(false);

    model.validateSync();
    expect(ref.isValidated).toBe(false);

    ref.validateSync();
    expect(ref.isValidated).toBe(true);
  });

  it('Ref::isValid, Ref::isInvalid', () => {
    const model = new Model(
      {
        type: 'number',
      },
      1,
    );

    const ref = model.ref();
    expect(ref.isValid).toBe(false);
    expect(ref.isInvalid).toBe(false);

    ref.validateSync();
    expect(ref.isValid).toBe(true);
    expect(ref.isInvalid).toBe(false);

    ref.value = '';
    ref.validateSync();
    expect(ref.isValid).toBe(false);
    expect(ref.isInvalid).toBe(true);
  });

  it('Ref::isPending, Ref::isPristine', async () => {
    const model = new Model(
      {
        asyncSchema: () => Promise.resolve({
          type: 'number',
        }),
      },
      1,
    );

    const ref = model.ref();
    expect(ref.isPristine).toBe(true);
    expect(ref.isPending).toBe(false);

    const fn = jest.fn(() => {
      if (fn.mock.length === 2) {
        expect(ref.isPristine).toBe(false);
        expect(ref.isPending).toBe(true);
      } else if (fn.mock.length === 3) {
        expect(ref.isPristine).toBe(false);
        expect(ref.isPending).toBe(false);
        expect(ref.isValid).toBe(true);
      }
    });
    model.observable.subscribe(fn);

    await ref.validateAsync();
  });

  it('Ref::isShouldNotBeBlank', () => {
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

    const fooRef = model.ref(['foo']);
    expect(fooRef.isShouldNotBeBlank).toBe(false);

    model.validateSync();
    expect(fooRef.isShouldNotBeBlank).toBe(true);
  });

  it('Ref::isTouched, Ref::isUntouched', () => {
    const model = new Model(
      {},
      {},
    );

    const ref = model.ref();
    expect(ref.isTouched).toBe(false);
    expect(ref.isUntouched).toBe(true);

    ref.validateSync();
    expect(ref.isTouched).toBe(true);
    expect(ref.isUntouched).toBe(false);
  });

  it('Ref::touch()', () => {
    const model = new Model(
      {},
      {},
    );

    const ref = model.ref();
    expect(ref.isTouched).toBe(false);
    expect(ref.isUntouched).toBe(true);

    ref.touch();
    expect(ref.isTouched).toBe(true);
    expect(ref.isUntouched).toBe(false);
  });

  it('Ref::withTouch()', () => {
    const model = new Model(
      {},
      {},
    );

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
});
