declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('format keyword', () => {
  it('Email format test', async () => {
    const validator = new Validator(
      {
        format: 'email',
      },
    );

    const ref = new Ref(new Storage('test@mail.com'));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue('foo');
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']!.messages[0]).toMatchObject({
      keyword: 'format',
      description: 'Should match format "{format}"',
      bindings: { format: 'email' },
    });

    ref.setValue('');
    await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();
  });

  // todo: cover with tests all format types

  it('Should expose error #1', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        format: 1,
      },
    ))
      .toThrow('The schema of the "format" keyword should be a string.');
  });

  it('Should expose error #2', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        format: 'foo',
      },
    ))
      .toThrow('Unknown string format supplied.');
  });
});
