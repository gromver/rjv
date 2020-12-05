declare const describe;
declare const it;
declare const expect;

import ValidateFnResult from './ValidateFnResult';

describe('ValidationResult tests', () => {
  it('should create ValidationResult instances', () => {
    expect(new ValidateFnResult(true))
      .toMatchObject({
        valid: true,
        messages: [],
      });
    expect(new ValidateFnResult(true, 'description'))
      .toMatchObject({
        valid: true,
        messages: [{
          success: true,
          keyword: 'inline',
          description: 'description',
          bindings: {},
        }],
      });
    expect(new ValidateFnResult(true, 'description {value}', 'test', { value: 1 }))
      .toMatchObject({
        valid: true,
        messages: [{
          success: true,
          keyword: 'test',
          description: 'description {value}',
          bindings: { value: 1 },
        }],
      });
    expect(new ValidateFnResult(false))
      .toMatchObject({
        valid: false,
        messages: [],
      });
    expect(new ValidateFnResult(false, 'description {value}', 'test', { value: 1 }))
      .toMatchObject({
        valid: false,
        messages: [{
          success: false,
          keyword: 'test',
          description: 'description {value}',
          bindings: { value: 1 },
        }],
      });
  });
});
