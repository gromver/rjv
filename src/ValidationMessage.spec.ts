declare const describe;
declare const it;
declare const expect;

import ValidationMessage, { injectVarsToString } from './ValidationMessage';

describe('ValidationMessage tests', () => {
  it('should create ValidationMessage instance', () => {
    expect(new ValidationMessage(false, 'test', 'description {value}', { value: 1 }))
      .toMatchObject({
        success: false,
        keyword: 'test',
        description: 'description {value}',
        bindings: { value: 1 },
      });

    expect(new ValidationMessage(true, 'test', 'description'))
      .toMatchObject({
        success: true,
        keyword: 'test',
        description: 'description',
        bindings: {},
      });
  });

  it('should return normalized description text #1', () => {
    const mes = new ValidationMessage(false, 'test', 'description {value}', { value: 1 });
    expect(mes.toString()).toBe('description 1');
    expect(`${mes}`).toBe('description 1');
  });

  it('should return normalized description text #2', () => {
    // @ts-ignore
    const mes = new ValidationMessage(false, 'test');
    expect(mes.toString()).toBe('undefined');
    expect(`${mes}`).toBe('undefined');
  });
});

describe('injectVarsToString tests', () => {
  it('should get a string with injected variables', () => {
    expect(injectVarsToString('{foo}', { foo: 'bar' })).toEqual('bar');
    expect(injectVarsToString('{{foo}}', { foo: 'bar' })).toEqual('{bar}');
    expect(injectVarsToString(
      '{a}, {b}, {c}',
      { a: 'A', b: 'B', c: 'C' },
    )).toEqual('A, B, C');
    expect(injectVarsToString(
      '{a}, {b}, {c}, {d}, {e}, {f}',
      { a: 0, b: '', c: null, d: false, e: undefined },
    )).toEqual('0, , null, false, undefined, {f}');
    expect(injectVarsToString(
      '{a}, {undefinedVariable}',
      { a: 'A' },
    )).toEqual('A, {undefinedVariable}');
  });
});
