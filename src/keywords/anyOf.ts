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

async function findValidSchemaRule(rules: IRule[], ref: Ref) {
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
      validate(ref: Ref, validateRuleFn: ValidateRuleFn, options): Promise<IRuleValidationResult> {
        return findValidSchemaRule(rules, ref)
          .then((rule) => {
            if (rule) {
              return validateRuleFn(ref, rule, options);
            }

            return ref.createErrorResult(new ValidationMessage(
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
