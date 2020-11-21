declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('maxProperties keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        maxProperties: 2,
      },
    );

    const ref = new Ref(new Storage({}));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue({ a: 1, b: 2, c: 3 });
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/'].messages[0]).toMatchObject({
      keyword: 'maxProperties',
      description: 'Should not have more than {limit} properties',
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
        maxProperties: '1',
      },
    ))
      .toThrow('The schema of the "maxProperties" keyword should be a number.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Validator(
      {
        maxProperties: -1,
      },
    ))
      .toThrow('The "maxProperties" keyword can\'t be less then 0.');
  });
});
