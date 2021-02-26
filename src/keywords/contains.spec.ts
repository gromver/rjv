declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('contains keyword', () => {
  it('sync test', async () => {
    const validator = new Validator(
      {
        contains: {
          type: 'number',
        },
      },
    );

    const ref = new Ref(new Storage([1, 'a', null]));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([null, 'test']);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']!.messages[0]).toMatchObject({
      keyword: 'contains',
      description: 'Should contain a valid item',
    });

    ref.setValue([]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();
  });

  it('async test', async () => {
    const validator = new Validator(
      {
        contains: {
          resolveSchema: () => Promise.resolve({ type: 'number' }),
        },
      },
    );

    const ref = new Ref(new Storage([1, 'a', null]));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([null, 'test']);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/']!.messages[0]).toMatchObject({
      keyword: 'contains',
      description: 'Should contain a valid item',
    });

    ref.setValue([]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.results['/']).toBeUndefined();
  });

  it('schema test', async () => {
    const validator = new Validator(
      {
        not: {
          type: 'array',
          items: {
            not: { type: 'number' },
          },
        },
      },
    );

    const ref = new Ref(new Storage([1, 'a', null]));

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);

    ref.setValue([null, 'test']);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue([]);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);

    ref.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
  });

  it('Should expose error', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        contains: 1,
      },
    ))
      .toThrow('The schema of the "contains" keyword should be a schema object.');
  });
});
