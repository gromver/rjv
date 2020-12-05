declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('minItems keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        minItems: 2,
      },
    );

    const ref = new Ref(new Storage([1, 2]));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']!.messages[0]).toMatchObject({
      keyword: 'minItems',
      description: 'Should not have fewer than {limit} items',
      bindings: { limit: 2 },
    });

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();
  });

  it('Should expose error #1', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        minItems: '1',
      },
    ))
      .toThrow('The schema of the "minItems" keyword should be a number.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Validator(
      {
        minItems: 0,
      },
    ))
      .toThrow('The "minItems" keyword can\'t be less then 1.');
  });
});
