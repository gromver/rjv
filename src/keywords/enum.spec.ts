declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

const ENUM = [1, { foo: 'bar' }, [1, 2, 3]];

describe('enum keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        enum: ENUM,
      },
    );

    const ref = new Ref(new Storage(1));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue(2);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']!.messages[0]).toMatchObject({
      keyword: 'enum',
      description: 'Should be equal to one of the allowed values',
      bindings: { allowedValues: ENUM },
    });

    ref.setValue({ foo: 'bar' });
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 2, 3]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([1, 2]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
  });
});
