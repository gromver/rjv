declare const jest;
declare const describe;
declare const it;
declare const expect;

import LodashStorage from './LodashStorage';

describe('Storage tests', () => {
  it('should set and get value properly, scalar value case', () => {
    const storage = new LodashStorage();

    expect(storage.get([])).toBeUndefined();
    storage.set([], 123);
    expect(storage.get([])).toBe(123);
    storage.set(['foo'], 'bar');
    expect(storage.get(['foo'])).toBe(undefined);
  });

  it('should set and get value properly, object value case', () => {
    const storage = new LodashStorage({});

    expect(storage.get([])).toMatchObject({});
    storage.set(['foo'], 'bar');
    expect(storage.get(['foo'])).toBe('bar');
  });
});
