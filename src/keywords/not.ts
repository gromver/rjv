import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, IRule, ValidateRuleFn, RuleValidationResult,
} from '../types';
import utils from '../utils';

const silentValidateFn: ValidateRuleFn = async (ref, rule) => {
  return rule.validate
    ? rule.validate(
      ref,
      {
        coerceTypes: false,
        removeAdditional: false,
      },
      silentValidateFn,
    )
    : undefined;
};

const keyword: IKeyword = {
  name: 'not',
  compile(compile, schema: ISchema, parentSchema) {
    if (!utils.isObject(schema)) {
      throw new Error('The value of the "not" keyword should be a schema object.');
    }

    const rule: IRule = compile(schema, parentSchema);  // all rules have validate() fn

    return {
      validate(ref) {
        return ((rule as any)
          .validate(
            ref,
            {
              coerceTypes: false,
              removeAdditional: false,
            },
            silentValidateFn,
          ) as Promise<RuleValidationResult>)
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
