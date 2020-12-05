declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('minProperties keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        minProperties: 2,
      },
    );

    const ref = new Ref(new Storage({ a: 1, b: 2 }));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue({ a: 1 });
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']!.messages[0]).toMatchObject({
      keyword: 'minProperties',
      description: 'Should not have fewer than {limit} properties',
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
        minProperties: '1',
      },
    ))
      .toThrow('The schema of the "minProperties" keyword should be a number.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Validator(
      {
        minProperties: 0,
      },
    ))
      .toThrow('The "minProperties" keyword can\'t be less then 1.');
  });
});
