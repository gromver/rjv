declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('anyOf keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        anyOf: [
          {
            type: 'number',
            maximum: 5,
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

    ref.value = 'abc';
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.value = 6;
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.value = 'abcd';
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('Properties integration tests', async () => {
    const validator = new Validator(
      {
        anyOf: [
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

    aRef.value = 'abc';
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    aRef.value = 6;
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    aRef.value = 'ab';
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('Should expose error #1', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        anyOf: 1,
      },
    ))
      .toThrow('The schema of the "anyOf" keyword should be an array of schemas.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        anyOf: [1],
      },
    ))
      .toThrow('Items of "anyOf" keyword should be a schema object.');
  });
});
