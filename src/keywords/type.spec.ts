declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';

describe('type keyword', () => {
  it('Test string', async () => {
    const model = new Model();
    await model.init(
      {
        type: 'string',
      },
      'abc',
    );

    const ref = model.ref();
    const isValid = await ref.validate();

    expect(isValid).toBe(true);
    expect(ref.isValid).toBe(true);

    ref.setValue({});
    await ref.validate();
    expect(ref.isValid).toBe(false);
    expect(ref.state.message).toMatchObject({
      keyword: 'type',
      description: 'Should be string',
      bindings: {
        types: ['string'],
        typesAsString: 'string',
      },
    });

    ref.setValue(1);
    await ref.validate();
    expect(ref.isValid).toBe(false);

    ref.setValue(undefined);
    await ref.validate();
    expect(ref.isValid).toBe(false);
    expect(ref.state.valid).toBeUndefined();
  });

  it('Test number', async () => {
    const model = new Model();
    await model.init(
      {
        type: 'number',
      },
      1,
    );

    const ref = model.ref();
    const isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.isValid).toBe(true);

    ref.setValue(1.5);
    await ref.validate();
    expect(ref.isValid).toBe(true);

    ref.setValue({});
    await ref.validate();
    expect(ref.isValid).toBe(false);

    ref.setValue('1');
    await ref.validate();
    expect(ref.isValid).toBe(false);

    ref.setValue(undefined);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Test integer', async () => {
    const model = new Model();
    await model.init(
      {
        type: 'integer',
      },
      1,
    );

    const ref = model.ref();
    const isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.state.valid).toBe(true);

    ref.setValue(1.5);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue({});
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue('1');
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(undefined);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Test boolean', async () => {
    const model = new Model();
    await model.init(
      {
        type: 'boolean',
      },
      false,
    );

    const ref = model.ref();
    const isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.state.valid).toBe(true);

    ref.setValue(true);
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue({});
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue('1');
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(1);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(undefined);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Test array', async () => {
    const model = new Model();
    await model.init(
      {
        type: 'array',
      },
      [],
    );

    const ref = model.ref();
    const isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.state.valid).toBe(true);

    ref.setValue(1);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue({});
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue('1');
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(undefined);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Test object', async () => {
    const model = new Model();
    await model.init(
      {
        type: 'object',
      },
      {},
    );

    const ref = model.ref();
    const isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.state.valid).toBe(true);

    ref.setValue(1);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue([]);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue('1');
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(undefined);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Test multiple types', async () => {
    const model = new Model();
    await model.init(
      {
        type: ['array', 'integer'],
      },
      [],
    );

    const ref = model.ref();
    const isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.state.valid).toBe(true);

    ref.setValue({});
    await ref.validate();
    expect(ref.state.valid).toBe(false);
    expect(ref.state.message).toMatchObject({
      keyword: 'type',
      description: 'Should be array, integer',
      bindings: {
        types: ['array', 'integer'],
        typesAsString: 'array, integer',
      },
    });

    ref.setValue(1);
    await ref.validate();
    expect(ref.state.valid).toBe(true);

    ref.setValue(1.23);
    await ref.validate();
    expect(ref.state.valid).toBe(false);

    ref.setValue(undefined);
    await ref.validate();
    expect(ref.state.valid).toBeUndefined();
  });

  it('Coerce to number', async () => {
    const model = new Model();
    await model.init(
      {
        type: 'number',
        coerceTypes: true,
      },
      '123',
    );

    const ref = model.ref();
    let isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe(123);

    ref.setValue(true);
    isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe(1);

    ref.setValue(false);
    isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe(0);

    ref.setValue('a123');
    isValid = await ref.validate();
    expect(isValid).toBe(false);
    expect(ref.getValue()).toBe('a123');
  });

  it('Coerce to integer', async () => {
    const model = new Model();
    await model.init(
      {
        type: 'integer',
        coerceTypes: true,
      },
      '123',
    );

    const ref = model.ref();
    let isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe(123);

    ref.setValue(true);
    isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe(1);

    ref.setValue(false);
    isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe(0);

    ref.setValue('a123');
    isValid = await ref.validate();
    expect(isValid).toBe(false);
    expect(ref.getValue()).toBe('a123');

    ref.setValue('123.45');
    isValid = await ref.validate();
    expect(isValid).toBe(false);
    expect(ref.getValue()).toBe('123.45');
  });

  it('Coerce to number or integer', async () => {
    const model = new Model();
    await model.init(
      {
        type: ['number', 'integer'],
        coerceTypes: true,
      },
      '123',
    );

    const ref = model.ref();
    let isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe(123);

    ref.setValue('123.45');
    isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe(123.45);

    ref.setValue('a123');
    isValid = await ref.validate();
    expect(isValid).toBe(false);
    expect(ref.getValue()).toBe('a123');
  });

  it('Coerce to string', async () => {
    const model = new Model();
    await model.init(
      {
        type: 'string',
        coerceTypes: true,
      },
      123,
    );

    const ref = model.ref();
    let isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe('123');

    ref.setValue(123.45);
    isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe('123.45');

    ref.setValue(true);
    isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe('true');

    ref.setValue(false);
    isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe('false');

    const arr = [];
    ref.setValue(arr);
    isValid = await ref.validate();
    expect(isValid).toBe(false);
    expect(ref.getValue()).toBe(arr);
  });

  it('Coerce to boolean', async () => {
    const model = new Model();
    await model.init(
      {
        type: 'boolean',
        coerceTypes: true,
      },
      null,
    );

    const ref = model.ref();
    let isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe(false);

    ref.setValue('false');
    isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe(false);

    ref.setValue(0);
    isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe(false);

    ref.setValue('true');
    isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe(true);

    ref.setValue(1);
    isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe(true);

    ref.setValue('');
    isValid = await ref.validate();
    expect(isValid).toBe(false);
    expect(ref.getValue()).toBe('');
  });

  it('Coerce to null', async () => {
    const model = new Model();
    await model.init(
      {
        type: 'null',
        coerceTypes: true,
      },
      0,
    );

    const ref = model.ref();
    let isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe(null);

    ref.setValue('');
    isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe(null);

    ref.setValue(false);
    isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe(null);

    ref.setValue(123);
    isValid = await ref.validate();
    expect(isValid).toBe(false);
    expect(ref.getValue()).toBe(123);
  });

  it('Test model\'s coerceTypes option', async () => {
    const model = new Model({
      validation: {
        coerceTypes: true,
      },
    });
    await model.init(
      {
        type: 'number',
      },
      '123',
    );
    const ref = model.ref();
    const isValid = await ref.validate();
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe(123);
  });

  it('Test validation\'s process coerceTypes option', async () => {
    const model = new Model();
    await model.init(
      {
        type: 'number',
      },
      '123',
    );

    const ref = model.ref();
    const isValid = await ref.validate({
      coerceTypes: true,
    });
    expect(isValid).toBe(true);
    expect(ref.getValue()).toBe(123);
  });
});
