declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('items keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        items: {
          anyOf: [
            { type: 'number' },
            { type: 'string' },
          ],
        },
      },
    );

    const ref = new Ref(new Storage([1, 'test']));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 'test', null]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();
  });

  it('Some ajv tests #1', async () => {
    const validator = new Validator(
      {
        items: {
          type: 'number',
        },
      },
    );

    const ref = new Ref(new Storage([1, 2, 3]));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 'test']);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue([]);
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();
  });

  it('Some ajv tests #2', async () => {
    const validator = new Validator(
      {
        items: [
          { type: 'integer' },
          { type: 'string' },
        ],
      },
    );

    const ref = new Ref(new Storage([1]));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 'test']);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 'test', 2]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue(['test', 1]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(['test']);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue([]);
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();
  });

  it('Should expose error #1', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        items: 1,
      },
    ))
      .toThrow('The schema of the "items" keyword should be an object or array of schemas.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        items: [1],
      },
    ))
      .toThrow('Each item of the "items" keyword should be a schema object.');
  });

  it('additionalItems test #1', async () => {
    const validator = new Validator(
      {
        items: { type: 'integer' },
        additionalItems: { type: 'string' },
      },
    );

    const ref = new Ref(new Storage([]));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']).toBeUndefined();

    ref.setValue([1, 2]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 'abc']);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('additionalItems test #2', async () => {
    const validator = new Validator(
      {
        items: [
          { type: 'integer' },
          { type: 'integer' },
        ],
        additionalItems: true,
      },
    );

    const ref = new Ref(new Storage([]));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']).toBeUndefined();

    ref.setValue([1, 2]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 2, 'abc']);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 'abc']);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue([1, 'abc', 2]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('additionalItems test #3', async () => {
    const validator = new Validator(
      {
        items: [
          { type: 'integer' },
          { type: 'integer' },
        ],
        additionalItems: { type: 'string' },
      },
    );

    const ref = new Ref(new Storage([]));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']).toBeUndefined();

    ref.setValue([1, 2]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 2, 'abc']);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 2, 3]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('additionalItems test #4', async () => {
    const validator = new Validator(
      {
        items: [
          { type: 'integer' },
          { type: 'integer' },
        ],
        additionalItems: false,
      },
    );

    const ref = new Ref(new Storage([]));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']).toBeUndefined();

    ref.setValue([1, 2]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 2, 3]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/'].messages[0]).toMatchObject({
      description: 'Should not have more than {limit} items',
      bindings: { limit: 2 },
    });
  });

  it('additionalItems async test #1', async () => {
    const validator = new Validator(
      {
        items: { type: 'integer' },
        additionalItems: { resolveSchema: () => Promise.resolve({ type: 'string' }) },
      },
    );

    const ref = new Ref(new Storage([]));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']).toBeUndefined();

    ref.setValue([1, 2]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 'abc']);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('additionalItems async test #2', async () => {
    const validator = new Validator(
      {
        items: [
          { resolveSchema: () => Promise.resolve({ type: 'integer' }) },
          { type: 'integer' },
        ],
        additionalItems: true,
      },
    );

    const ref = new Ref(new Storage([]));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']).toBeUndefined();

    ref.setValue([1, 2]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 2, 'abc']);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 'abc']);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue([1, 'abc', 2]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('additionalItems async test #3', async () => {
    const validator = new Validator(
      {
        items: [
          { resolveSchema: () => Promise.resolve({ type: 'integer' }) },
          { type: 'integer' },
        ],
        additionalItems: { type: 'string' },
      },
    );

    const ref = new Ref(new Storage([]));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']).toBeUndefined();

    ref.setValue([1, 2]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 2, 'abc']);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 2, 3]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('additionalItems async test #4', async () => {
    const validator = new Validator(
      {
        items: [
          { type: 'integer' },
          { type: 'integer' },
        ],
        additionalItems: { resolveSchema: () => Promise.resolve({ type: 'string' }) },
      },
    );

    const ref = new Ref(new Storage([]));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']).toBeUndefined();

    ref.setValue([1, 2]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 2, 'abc']);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 2, 3]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('additionalItems async test #5', async () => {
    const validator = new Validator(
      {
        items: [
          { resolveSchema: () => Promise.resolve({ type: 'integer' }) },
          { type: 'integer' },
        ],
        additionalItems: false,
      },
    );

    const ref = new Ref(new Storage([]));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']).toBeUndefined();

    ref.setValue([1, 2]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 2, 3]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/'].messages[0]).toMatchObject({
      keyword: 'items_overflow',
      description: 'Should not have more than {limit} items',
      bindings: { limit: 2 },
    });
  });

  it('removeAdditional test #1', async () => {
    const validator = new Validator(
      {
        items: [
          { type: 'integer' },
          { type: 'integer' },
        ],
        additionalItems: { type: 'string' },
        removeAdditional: true,
      },
    );

    const ref = new Ref(new Storage([]));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']).toBeUndefined();

    ref.setValue([1, 2]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 2, 'abc']);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 2, 3, 'abc', 4]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toMatchObject([1, 2, 'abc']);
  });

  it('removeAdditional test #2', async () => {
    const validator = new Validator(
      {
        items: [
          { type: 'integer' },
          { type: 'integer' },
        ],
        removeAdditional: true,
      },
    );

    const ref = new Ref(new Storage([]));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']).toBeUndefined();

    ref.setValue([1, 2]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 2, 'abc', 3, 5, true]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.value).toMatchObject([1, 2]);
  });
});
