declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('minimum keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        minimum: 5,
      },
    );

    const ref = new Ref(new Storage(5));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue(4);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']!.messages[0]).toMatchObject({
      keyword: 'minimum',
      description: 'Should be greater than or equal {limit}',
      bindings: { limit: 5, exclusive: false },
    });

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();
  });

  it('Some integration tests with exclusive mode', async () => {
    const validator = new Validator(
      {
        minimum: 5,
        exclusiveMinimum: true,
      },
    );

    const ref = new Ref(new Storage(6));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue(5);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']!.messages[0]).toMatchObject({
      keyword: 'minimum_exclusive',
      description: 'Should be greater than {limit}',
      bindings: { limit: 5, exclusive: true },
    });
  });

  it('Should expose error', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        minimum: '1',
      },
    ))
      .toThrow('The schema of the "minimum" keyword should be a number.');
  });
});
