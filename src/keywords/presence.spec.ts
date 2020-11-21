declare const describe;
declare const it;
declare const expect;

import Validator from '../Validator';
import Ref from '../utils/Ref';
import Storage from '../utils/Storage';

describe('presence keyword', () => {
  it('Some integration tests', async () => {
    const validator = new Validator(
      {
        properties: {
          foo: {
            presence: true,
          },
          bar: {
            presence: {
              trim: true,
            },
          },
          car: {},
        },
      },
    );

    const ref = new Ref(new Storage({
      bar: null,
    }));
    const fooRef = ref.ref('foo');
    const barRef = ref.ref('bar');

    let res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/foo'].valid).toBe(false);
    expect(res.results['/foo'].messages[0]).toMatchObject({
      keyword: 'presence',
      description: 'Should not be blank',
      bindings: { path: '/foo' },
    });
    expect(res.results['/bar'].valid).toBe(true);
    expect(res.results['/car']).toBeUndefined();

    fooRef.setValue('');
    res = await validator.validateRef(ref);
    expect(res.results['/foo'].valid).toBe(false);

    fooRef.setValue('abc');
    res = await validator.validateRef(ref);
    expect(res.results['/foo'].valid).toBe(true);

    fooRef.setValue(null);
    res = await validator.validateRef(ref);
    expect(res.results['/foo'].valid).toBe(true);

    fooRef.setValue(0);
    res = await validator.validateRef(ref);
    expect(res.results['/foo'].valid).toBe(true);

    fooRef.setValue([]);
    res = await validator.validateRef(ref);
    expect(res.results['/foo'].valid).toBe(true);

    fooRef.setValue({});
    res = await validator.validateRef(ref);
    expect(res.results['/foo'].valid).toBe(true);

    barRef.setValue('   ');
    res = await validator.validateRef(ref);
    expect(res.results['/bar'].valid).toBe(false);
    expect(barRef.value).toBe('');

    barRef.setValue(' foo ');
    res = await validator.validateRef(ref);
    expect(res.results['/bar'].valid).toBe(true);
    expect(barRef.value).toBe('foo');
  });

  it('Test default and presence keywords case #1', async () => {
    const validator = new Validator(
      {
        properties: {
          foo: {
            presence: {
              trim: true,
            },
            default: '',
          },
        },
      },
    );

    const ref = new Ref(new Storage({}));

    const res = await validator.validateRef(ref);
    expect(res.valid).toBe(false);
    expect(res.results['/foo'].valid).toBe(false);
  });

  it('Test default and presence keywords case #2', async () => {
    const validator = new Validator(
      {
        properties: {
          foo: {
            presence: {
              trim: true,
            },
            default: ' abc ',
          },
        },
      },
    );

    const ref = new Ref(new Storage({}));

    const res = await validator.validateRef(ref);
    expect(res.valid).toBe(true);
    expect(ref.ref('foo').value).toBe('abc');
  });

  it('Should expose error', async () => {
    await expect(() => new Validator(
      {
        // @ts-ignore
        properties: {
          foo: {
            presence: null,
          },
        },
      },
    ))
      .toThrow('The schema of the "presence" keyword should be a boolean value or an object.');
  });
});
