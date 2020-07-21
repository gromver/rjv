declare const describe;
declare const it;
declare const expect;

import utils from './utils';

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
