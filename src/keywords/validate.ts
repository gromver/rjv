import {
  ISchema,
  IKeyword,
  IRef,
  ValidateRuleFn,
  RuleValidationResult,
  IRuleValidationOptions,
  IInlineValidationResult,
} from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'validate',
  compile(
    compile,
    schema: (ref: IRef, validateRuleFn: ValidateRuleFn, options: IRuleValidationOptions)
      => IInlineValidationResult | Promise<IInlineValidationResult>,
  ) {
    if (typeof schema !== 'function') {
      throw new Error(
        'The schema of the "validate" keyword should be an async validation function.',
      );
    }

    return {
      async validate(ref, options, validateRuleFn)
        : Promise<RuleValidationResult> {
        const result = await schema(ref, validateRuleFn, options);

        return result !== undefined ? utils.toValidationResult(result) : undefined;
      },
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    validate?: (ref: IRef, validateRuleFn: ValidateRuleFn, options: IRuleValidationOptions)
      => IInlineValidationResult | Promise<IInlineValidationResult>;
  }
}
