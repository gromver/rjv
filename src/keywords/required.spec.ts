declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('required keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        required: ['foo', 'bar'],
      },
    );

    const ref = new Ref(
      new Storage({
        bar: null,
      }),
      '/',
    );
    const fooRef = ref.ref('foo');
    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']!.messages[0]).toMatchObject({
      keyword: 'required',
      description: 'Should have all required properties',
      bindings: { invalidProperties: ['foo'] },
    });

    fooRef.setValue(undefined);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    fooRef.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
  });
});
