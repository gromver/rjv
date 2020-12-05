import { IValidateFnResult } from './types';
import ValidationMessage from './ValidationMessage';

const DEFAULT_KEYWORD = 'inline';

/**
 * Creates a validation result object.
 * Used by the build-in keywords and inline validation functions
 */
export default class ValidateFnResult implements IValidateFnResult {
  messages: ValidationMessage[] = [];

  constructor(
    public readonly valid: boolean,
    description?: string,
    keyword?: string,
    bindings?: {},
  ) {
    if (description) {
      const message =
        new ValidationMessage(valid, keyword || DEFAULT_KEYWORD, description, bindings);

      this.messages.push(message);
    }
  }
}
