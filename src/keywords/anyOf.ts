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

async function findValidSchemaRule(rules: IRule[], ref: IRef) {
  for (let i = 0; i < rules.length; i += 1) {
    const rule = rules[i] as any;

    const result = await rule.validate(ref, validateFn, {
      coerceTypes: false,
      removeAdditional: false,
    });

    if (result.valid === true) {
      return rule;
    }
  }
}

const keyword: IKeyword = {
  name: 'anyOf',
  compile(compile: CompileFn, schema: ISchema[], parentSchema: ISchema): IRule {
    if (!Array.isArray(schema)) {
      throw new Error('The schema of the "anyOf" keyword should be an array of schemas.');
    }

    const rules: IRule[] = [];

    schema.forEach((item) => {
      if (!utils.isObject(item)) {
        throw new Error('Items of "anyOf" keyword should be a schema object.');
      }

      rules.push(compile(item, parentSchema));  // all rules have validate() fn
    });

    return {
      validate(ref: IRef, validateRuleFn: ValidateRuleFn, options)
        : Promise<RuleValidationResult> {
        return findValidSchemaRule(rules, ref)
          .then((rule) => {
            if (rule) {
              return validateRuleFn(ref, rule, options);
            }

            return utils.createErrorResult(new ValidationMessage(
              false,
              keyword.name,
              'Should match some schema in anyOf',
            ));
          });
      },
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    anyOf?: ISchema[];
  }
}
