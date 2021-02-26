declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('oneOf keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        oneOf: [
          {
            type: 'number',
            maximum: 5,
          },
          {
            type: 'number',
            minimum: 3,
          },
          {
            type: 'string',
            maxLength: 3,
          },
        ],
      },
    );

    const ref = new Ref(new Storage(1));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue('abc');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue(4);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue('abcd');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('Properties integration tests', async () => {
    const validator = new Validator(
      {
        oneOf: [
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
          {
            properties: {
              a: {
                type: 'string',
                minLength: 3,
              },
            },
          },
        ],
      },
    );

    const ref = new Ref(new Storage({ a: 1 }));
    const aRef = ref.ref('a');

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    aRef.setValue('abc');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    aRef.setValue(4);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    aRef.setValue('ab');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('Should expose error #1', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        oneOf: 1,
      },
    ))
      .toThrow('The schema of the "oneOf" keyword should be an array of schemas.');
  });

  it('Should expose error 2', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        oneOf: [1],
      },
    ))
      .toThrow('Items of "oneOf" keyword should be a schema object.');
  });
});
