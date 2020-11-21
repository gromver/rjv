declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('type keyword', () => {
  it('Test string', async () => {
    const validator = new Validator(
      {
        type: 'string',
      },
    );
    await expect(validator.validateData('abc')).resolves.toMatchObject({
      valid: true,
    });

    await expect(validator.validateData({})).resolves.toMatchObject({
      valid: false,
      results: {
        '/': {
          valid: false,
          messages: [
            {
              success: false,
              keyword: 'type',
              description: 'Should be {typesAsString}',
              bindings: {
                types: ['string'],
                typesAsString: 'string',
              },
            },
          ],
        },
      },
    });

    await expect(validator.validateData(1)).resolves.toMatchObject({
      valid: false,
    });

    await expect(validator.validateData(undefined)).resolves.toMatchObject({
      valid: false,
    });
  });

  it('Test number', async () => {
    const validator = new Validator(
      {
        type: 'number',
      },
    );

    const ref = new Ref(new Storage(1));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue(1.5);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue({});
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue('1');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(undefined);
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();
  });

  it('Test integer', async () => {
    const validator = new Validator(
      {
        type: 'integer',
      },
    );

    const ref = new Ref(new Storage(1));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue(1.5);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue({});
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue('1');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(undefined);
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();
  });

  it('Test boolean', async () => {
    const validator = new Validator(
      {
        type: 'boolean',
      },
    );

    const ref = new Ref(new Storage(false));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue(true);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue({});
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue('1');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(1);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(undefined);
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();
  });

  it('Test array', async () => {
    const validator = new Validator(
      {
        type: 'array',
      },
    );

    const ref = new Ref(new Storage([]));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue(1);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue({});
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue('1');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(undefined);
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();
  });

  it('Test object', async () => {
    const validator = new Validator(
      {
        type: 'object',
      },
    );

    const ref = new Ref(new Storage({}));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue(1);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue([]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue('1');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(undefined);
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();
  });

  it('Test multiple types', async () => {
    const validator = new Validator(
      {
        type: ['array', 'integer'],
      },
    );

    const ref = new Ref(new Storage([]));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue({});
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/'].messages[0]).toMatchObject({
      keyword: 'type',
      description: 'Should be {typesAsString}',
      bindings: {
        types: ['array', 'integer'],
        typesAsString: 'array, integer',
      },
    });

    ref.setValue(1);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue(1.23);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(undefined);
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();
  });

  it('Coerce to number', async () => {
    const validator = new Validator(
      {
        type: 'number',
        coerceTypes: true,
      },
    );

    const ref = new Ref(new Storage('123'));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe(123);

    ref.setValue(true);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe(1);

    ref.setValue(false);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe(0);

    ref.setValue('a123');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(ref.value).toBe('a123');
  });

  it('Coerce to integer', async () => {
    const validator = new Validator(
      {
        type: 'integer',
        coerceTypes: true,
      },
    );

    const ref = new Ref(new Storage('123'));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe(123);

    ref.setValue(true);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe(1);

    ref.setValue(false);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe(0);

    ref.setValue('a123');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(ref.value).toBe('a123');

    ref.setValue('123.45');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(ref.value).toBe('123.45');
  });

  it('Coerce to number or integer', async () => {
    const validator = new Validator(
      {
        type: ['number', 'integer'],
        coerceTypes: true,
      },
    );

    const ref = new Ref(new Storage('123'));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe(123);

    ref.setValue('123.45');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe(123.45);

    ref.setValue('a123');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(ref.value).toBe('a123');
  });

  it('Coerce to string', async () => {
    const validator = new Validator(
      {
        type: 'string',
        coerceTypes: true,
      },
    );

    const ref = new Ref(new Storage(123));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe('123');

    ref.setValue(123.45);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe('123.45');

    ref.setValue(true);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe('true');

    ref.setValue(false);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe('false');

    const arr = [];
    ref.setValue(arr);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(ref.value).toBe(arr);
  });

  it('Coerce to boolean', async () => {
    const validator = new Validator(
      {
        type: 'boolean',
        coerceTypes: true,
      },
    );

    const ref = new Ref(new Storage(null));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe(false);

    ref.setValue('false');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe(false);

    ref.setValue(0);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe(false);

    ref.setValue('true');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe(true);

    ref.setValue(1);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe(true);

    ref.setValue('');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(ref.value).toBe('');
  });

  it('Coerce to null', async () => {
    const validator = new Validator(
      {
        type: 'null',
        coerceTypes: true,
      },
    );

    const ref = new Ref(new Storage(0));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe(null);

    ref.setValue('');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe(null);

    ref.setValue(false);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe(null);

    ref.setValue(123);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(ref.value).toBe(123);
  });

  it('Test model\'s coerceTypes option', async () => {
    const validator = new Validator(
      {
        type: 'number',
      },
      {
        coerceTypes: true,
      },
    );

    const ref = new Ref(new Storage('123'));

    const res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toBe(123);
  });

  it('Test validation\'s process coerceTypes option', async () => {
    const validator = new Validator(
      {
        type: 'number',
      },
    );

    const ref = new Ref(new Storage('123'));

    const res = await validator.validateRef(ref, { coerceTypes: true });
    expect(res.valid).toBe(true);
    expect(ref.value).toBe(123);
  });
});
