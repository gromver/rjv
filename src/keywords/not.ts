import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, CompileFn, IRule, IRef, ValidateRuleFn, RuleValidationResult,
} from '../types';
import utils from '../utils';

const validateFn: ValidateRuleFn = async (ref: IRef, rule: IRule)
  : Promise<RuleValidationResult> => {
  return rule.validate
    ? rule.validate(ref, validateFn, {
      coerceTypes: false,
      removeAdditional: false,
    })
    : undefined;
};

const keyword: IKeyword = {
  name: 'not',
  compile(compile: CompileFn, schema: ISchema, parentSchema: ISchema): IRule {
    if (!utils.isObject(schema)) {
      throw new Error('The value of the "not" keyword should be a schema object.');
    }

    const rule: IRule = compile(schema, parentSchema);  // all rules have validate() fn

    return {
      validate(ref: IRef, validateRuleFn: ValidateRuleFn, options)
        : Promise<RuleValidationResult> {
        return ((rule as any)
          .validate(ref, validateFn, {
            coerceTypes: false,
            removeAdditional: false,
          }) as Promise<RuleValidationResult>)
          .then((result) => {
            if (result && !result.valid) {
              return utils.createSuccessResult();
            }

            return utils.createErrorResult(new ValidationMessage(
              false,
              keyword.name,
              'Should not be valid',
            ));
          });
      },
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    not?: ISchema;
  }
}
