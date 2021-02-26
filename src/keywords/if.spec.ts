declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('if keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        if: {
          type: 'number',
          maximum: 5,
        },
        then: {
          type: 'integer',
        },
        else: {
          type: 'number',
        },
      },
    );

    const ref = new Ref(new Storage(5));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue(4.5);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(6);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue('abc');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('Properties integration tests', async () => {
    const validator = new Validator(
      {
        if: {
          properties: {
            power: { minimum: 9000 },
          },
        },
        then: { required: ['disbelief'] },
        else: { required: ['confidence'] },
      },
    );

    const ref = new Ref(new Storage({ power: 10000, disbelief: true }));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue({ power: 1000, confidence: true });
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue({});
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();

    ref.setValue({ power: 10000 });
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue({ power: 10000, confidence: true });
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue({ power: 1000 });
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('Should expose error #1', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        if: 1,
      },
    ))
      .toThrow('The value of the "if" keyword should be a schema object.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Validator(
      {
        if: {},
      },
    ))
      .toThrow('For the "if" keyword You must specify at least the keyword "then" or "else".');
  });
});
