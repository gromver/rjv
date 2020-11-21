declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('multipleOf keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        multipleOf: 2,
      },
    );

    const ref = new Ref(new Storage(4));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue(4.1);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/'].messages[0]).toMatchObject({
      keyword: 'multipleOf',
      description: 'Should be multiple of {multiplier}',
      bindings: { multiplier: 2 },
    });

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();
  });

  it('Should expose error #1', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        multipleOf: '1',
      },
    ))
      .toThrow('The schema of the "multipleOf" keyword should be a number.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Validator(
      {
        multipleOf: 0,
      },
    ))
      .toThrow('The "multipleOf" keyword can\'t be zero.');
  });
});
