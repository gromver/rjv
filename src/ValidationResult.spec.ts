declare const describe;
declare const it;
declare const expect;

import ValidationResult from './ValidationResult';

describe('ValidationResult tests', () => {
  it('should create ValidationResult instances', () => {
    expect(new ValidationResult(true))
      .toMatchObject({
        valid: true,
        messages: [],
      });
    expect(new ValidationResult(true, 'description'))
      .toMatchObject({
        valid: true,
        messages: [{
          success: true,
          keyword: 'inline',
          description: 'description',
          bindings: {},
        }],
      });
    expect(new ValidationResult(true, 'description {value}', 'test', { value: 1 }))
      .toMatchObject({
        valid: true,
        messages: [{
          success: true,
          keyword: 'test',
          description: 'description {value}',
          bindings: { value: 1 },
        }],
      });
    expect(new ValidationResult(false))
      .toMatchObject({
        valid: false,
        messages: [],
      });
    expect(new ValidationResult(false, 'description {value}', 'test', { value: 1 }))
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
