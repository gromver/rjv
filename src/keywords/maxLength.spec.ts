declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('maxLength keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        maxLength: 3,
      },
    );

    const ref = new Ref(new Storage('abc'));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue('abcd');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']!.messages[0]).toMatchObject({
      keyword: 'maxLength',
      description: 'Should not be longer than {limit} characters',
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
        maxLength: '1',
      },
    ))
      .toThrow('The schema of the "maxLength" keyword should be a number.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Validator(
      {
        maxLength: -1,
      },
    ))
      .toThrow('The "maxLength" keyword can\'t be less then 0.');
  });
});
