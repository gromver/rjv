declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('maximum keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        maximum: 5,
      },
    );

    const ref = new Ref(new Storage(5));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue(6);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/'].messages[0]).toMatchObject({
      keyword: 'maximum',
      description: 'Should be less than or equal {limit}',
      bindings: { limit: 5, exclusive: false },
    });

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();
  });

  it('Some integration tests with exclusive mode', async () => {
    const validator = new Validator(
      {
        maximum: 5,
        exclusiveMaximum: true,
      },
    );

    const ref = new Ref(new Storage(4));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue(5);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/'].messages[0]).toMatchObject({
      keyword: 'maximum_exclusive',
      description: 'Should be less than {limit}',
      bindings: { limit: 5, exclusive: true },
    });
  });

  it('Should expose error', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        maximum: '1',
      },
    ))
      .toThrow('The schema of the "maximum" keyword should be a number.');
  });
});
