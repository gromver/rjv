declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('pattern keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        pattern: '[abc]+',
      },
    );

    const ref = new Ref(new Storage('a'));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue('abcd');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue('cde');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue('');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/'].messages[0]).toMatchObject({
      keyword: 'pattern',
      description: 'Should match pattern {pattern}',
      bindings: { pattern: '[abc]+' },
    });

    ref.setValue('def');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']).toBeUndefined();
  });

  it('Should expose error', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        pattern: 1,
      },
    ))
      .toThrow('The schema of the "pattern" keyword should be a string.');
  });
});
