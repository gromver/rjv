declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('applySchemas keyword', () => {
  it('Some integration tests #1', async () => {
    const validator = new Validator(
      {
        applySchemas: [
          {
            type: 'number',
            maximum: 5,
          },
          {
            type: 'number',
            minimum: 3,
          },
        ],
      },
    );

    const ref = new Ref(new Storage(3));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue(1);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue('abc');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(6);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('Some integration tests #2', async () => {
    const validator = new Validator(
      {
        applySchemas: [
          {
            type: 'number',
            maximum: 5,
          },
          {
            type: 'string',
          },
        ],
      },
    );

    const ref = new Ref(new Storage(3));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(6);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue('abc');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('Some integration tests #3', async () => {
    const validator = new Validator(
      {
        applySchemas: [
          {
            if: { type: 'number' },
            then: { maximum: 5 },
          },
          {
            if: { type: 'string' },
            then: { minLength: 3 },
          },
        ],
      },
    );

    const ref = new Ref(new Storage(3));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue(6);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue('abc');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue('ab');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']).toBeUndefined();
  });

  it('Properties integration tests', async () => {
    const validator = new Validator(
      {
        applySchemas: [
          {
            properties: {
              a: {
                type: 'number',
                maximum: 5,
              },
            },
          },
          {
            properties: {
              a: {
                type: 'number',
                minimum: 3,
              },
            },
          },
        ],
      },
    );

    const ref = new Ref(new Storage({ a: 4 }));
    const aRef = ref.ref('a');

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    aRef.setValue(1);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    aRef.setValue('abc');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    aRef.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('Should expose error #1', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        applySchemas: 1,
      },
    ))
      .toThrow('The schema of the "applySchemas" keyword should be an array of schemas.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        applySchemas: [1],
      },
    ))
      .toThrow('Items of "applySchemas" keyword should be a schema object.');
  });
});
