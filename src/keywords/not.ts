import Ref from '../Ref';
import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, CompileFn, IRule, ValidateRuleFn, IRuleValidationResult,
} from '../types';
import utils from '../utils';

const validateFn: ValidateRuleFn = (ref: Ref, rule: IRule): Promise<IRuleValidationResult> => {
  return rule.validate
    ? rule.validate(ref, validateFn, {
      coerceTypes: false,
      removeAdditional: false,
    })
    : Promise.resolve({});
};

const keyword: IKeyword = {
  name: 'not',
  compile(compile: CompileFn, schema: ISchema, parentSchema: ISchema): IRule {
    if (!utils.isObject(schema)) {
      throw new Error('The value of the "not" keyword should be a schema object.');
    }

    const rule: IRule = compile(schema, parentSchema);  // all rules have validate() fn

    return {
      validate(ref: Ref, validateRuleFn: ValidateRuleFn, options): Promise<IRuleValidationResult> {
        return ((rule as any)
          .validate(ref, validateFn, {
            coerceTypes: false,
            removeAdditional: false,
          }) as Promise<IRuleValidationResult>)
          .then((result) => {
            if (result.valid === false) {
              return ref.createSuccessResult();
            }

            return ref.createErrorResult(new ValidationMessage(
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
