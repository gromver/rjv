declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('minLength keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        minLength: 3,
      },
    );

    const ref = new Ref(new Storage('abc'));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue('ab');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/'].messages[0]).toMatchObject({
      keyword: 'minLength',
      description: 'Should not be shorter than {limit} characters',
      bindings: { limit: 3 },
    });

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();
  });

  it('Should expose error #1', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        minLength: '1',
      },
    ))
      .toThrow('The schema of the "minLength" keyword should be a number.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Validator(
      {
        minLength: 0,
      },
    ))
      .toThrow('The "minLength" keyword can\'t be less then 1.');
  });
});
