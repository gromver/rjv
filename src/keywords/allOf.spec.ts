declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('allOf keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        allOf: [
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

    ref.value = 1;
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.value = 'abc';
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.value = null;
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('Properties integration tests', async () => {
    const validator = new Validator(
      {
        allOf: [
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

    aRef.value = 1;
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    aRef.value = 'abc';
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    aRef.value = null;
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('Should expose error #1', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        allOf: 1,
      },
    ))
      .toThrow('The schema of the "allOf" keyword should be an array of schemas.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        allOf: [1],
      },
    ))
      .toThrow('Items of "allOf" keyword should be a schema object.');
  });
});
