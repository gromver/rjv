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
  name: 'oneOf',
  compile(compile: CompileFn, schema: ISchema[], parentSchema: ISchema): IRule {
    if (!Array.isArray(schema)) {
      throw new Error('The schema of the "oneOf" keyword should be an array of schemas.');
    }

    const rules: IRule[] = [];

    schema.forEach((item) => {
      if (!utils.isObject(item)) {
        throw new Error('Items of "oneOf" keyword should be a schema object.');
      }

      rules.push(compile(item, parentSchema));  // all rules have validate() fn
    });

    return {
      validate(ref: IRef, validateRuleFn: ValidateRuleFn, options)
        : Promise<RuleValidationResult> {
        const jobs: Promise<RuleValidationResult>[] = rules
          .map(
            (rule) => (rule as any)
              .validate(ref, validateFn, {
                coerceTypes: false,
                removeAdditional: false,
              }) as Promise<RuleValidationResult>,
          );

        return Promise.all(jobs).then((results) => {
          const validRules: IRule[] = [];

          results.forEach((result, index) => {
            if (result && result.valid) {
              validRules.push(rules[index]);
            }
          });

          if (validRules.length === 1) {
            return validateRuleFn(ref, validRules[0], options);
          }

          return utils.createErrorResult(new ValidationMessage(
            false,
            keyword.name,
            'Should match exactly one schema in oneOf',
          ));
        });
      },
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    oneOf?: ISchema[];
  }
}
