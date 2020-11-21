declare const describe;
declare const it;
declare const expect;

import utils from './index';

describe('utils.resolvePath tests', () => {
  it('should get path as array properly', () => {
    expect(utils.pathToArray(utils.resolvePath('foo/2/bar/03', '/')))
      .toEqual(['foo', 2, 'bar', 3]);
    expect(utils.pathToArray(utils.resolvePath('foo/bar', '/host')))
      .toEqual(['host', 'foo', 'bar']);
    expect(utils.pathToArray(utils.resolvePath('foo/bar', '/1')))
      .toEqual([1, 'foo', 'bar']);
    expect(utils.pathToArray(utils.resolvePath('../bar', '/a/b/c')))
      .toEqual(['a', 'b', 'bar']);
    expect(utils.pathToArray(utils.resolvePath('../bar', '/a/b/c/../')))
      .toEqual(['a', 'bar']);
  });
});

describe('utils.pathToKey tests', () => {
  it('should get path as string properly', () => {
    expect(utils.pathToKey(['foo', 2, 'bar', 3])).toEqual('/foo/2/bar/3');
  });
});

describe('utils.withTrailingSlash tests', () => {
  it('should get a string with one trailing slash at the end', () => {
    expect(utils.withTrailingSlash('/path')).toEqual('/path/');
    expect(utils.withTrailingSlash('/path/')).toEqual('/path/');
    expect(utils.withTrailingSlash('/path///')).toEqual('/path/');
    expect(utils.withTrailingSlash('/path/to')).toEqual('/path/to/');
    expect(utils.withTrailingSlash('')).toEqual('/');
    expect(utils.withTrailingSlash('/')).toEqual('/');
    expect(utils.withTrailingSlash('///')).toEqual('/');
  });
});

describe('utils.injectVarsToString tests', () => {
  it('should get a string with injected variables', () => {
    expect(utils.injectVarsToString('{foo}', { foo: 'bar' })).toEqual('bar');
    expect(utils.injectVarsToString('{{foo}}', { foo: 'bar' })).toEqual('{bar}');
    expect(utils.injectVarsToString(
      '{a}, {b}, {c}',
      { a: 'A', b: 'B', c: 'C' },
    )).toEqual('A, B, C');
    expect(utils.injectVarsToString(
      '{a}, {b}, {c}, {d}, {e}, {f}',
      { a: 0, b: '', c: null, d: false, e: undefined },
    )).toEqual('0, , null, false, undefined, {f}');
    expect(utils.injectVarsToString(
      '{a}, {undefinedVariable}',
      { a: 'A' },
    )).toEqual('A, {undefinedVariable}');
  });
});

describe('utils.mergeResults tests', () => {
  it('should get merged result #1', () => {
    const merged = utils.mergeResults([
      { valid: true, messages: [{ valid: true, keyword: 'a' } as any] },
      { valid: false, messages: [{ valid: false, keyword: 'b' } as any] },
    ]);
    expect(merged).toMatchObject({
      valid: false,
      messages: [
        { valid: true, keyword: 'a' },
        { valid: false, keyword: 'b' },
      ],
    });
  });
  it('should get merged result #2', () => {
    const merged = utils.mergeResults([
      { valid: true, messages: [{ valid: true, keyword: 'a' } as any] },
      { valid: true, messages: [{ valid: true, keyword: 'b' } as any] },
    ]);
    expect(merged).toMatchObject({
      valid: true,
      messages: [
        { valid: true, keyword: 'a' },
        { valid: true, keyword: 'b' },
      ],
    });
  });
  it('should get merged result #3', () => {
    const merged = utils.mergeResults([]);
    expect(merged).toMatchObject({
      valid: false,
      messages: [],
    });
  });
});