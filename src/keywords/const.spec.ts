declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('const keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        const: 'test',
      },
    );

    const ref = new Ref(new Storage('test'));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue('foo');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/'].messages[0]).toMatchObject({
      keyword: 'const',
      description: 'Should be equal to constant',
      bindings: { allowedValue: 'test' },
    });

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(undefined);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });

  it('Some integration tests with custom func', async () => {
    const validator = new Validator(
      {
        const: () => 'test',
      },
    );

    const ref = new Ref(new Storage('test'));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue('foo');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/'].messages[0]).toMatchObject({
      keyword: 'const',
      description: 'Should be equal to constant',
      bindings: { allowedValue: 'test' },
    });

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(undefined);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });
});
