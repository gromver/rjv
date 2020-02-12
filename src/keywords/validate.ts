import Ref from '../Ref';
import {
  ISchema, IKeyword, CompileFn, IRule, ValidateRuleFn, IRuleValidationResult,
} from '../types';

const keyword: IKeyword = {
  name: 'validate',
  compile(
    compile: CompileFn,
    schema: (ref: Ref, validateRuleFn: ValidateRuleFn) => Promise<IRuleValidationResult>,
    parentSchema: ISchema,
  ): IRule {
    if (typeof schema !== 'function') {
      throw new Error(
        'The schema of the "validate" keyword should be an async validation function.',
      );
    }

    return {
      validate(ref: Ref, validateRuleFn: ValidateRuleFn): Promise<IRuleValidationResult> {
        return schema(ref, validateRuleFn);
      },
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    validate?: (ref: Ref, validateRuleFn: ValidateRuleFn)
      => Promise<IRuleValidationResult>;
  }
}
