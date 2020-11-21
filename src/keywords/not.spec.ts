declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('not keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        not: {
          type: 'number',
          maximum: 5,
        },
      },
    );

    const ref = new Ref(new Storage(6));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue(4);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue('abc');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
  });

  it('Should expose error', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        not: 1,
      },
    ))
      .toThrow('The value of the "not" keyword should be a schema object.');
  });
});
