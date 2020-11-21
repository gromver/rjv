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
  name: 'oneOf',
  compile(compile, schema: ISchema[], parentSchema) {
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
      validate(ref, options, validateRuleFn) {
        const jobs: Promise<RuleValidationResult>[] = rules
          .map(
            (rule) => (rule as any).validate(
              ref,
              {
                coerceTypes: false,
                removeAdditional: false,
              },
              silentValidateFn,
            ) as Promise<RuleValidationResult>,
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
