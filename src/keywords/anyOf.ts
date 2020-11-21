import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, IRule, IRef, ValidateRuleFn,
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

async function findValidSchemaRule(rules: IRule[], ref: IRef) {
  for (let i = 0; i < rules.length; i += 1) {
    const rule = rules[i] as any;

    const result = await rule.validate(
      ref,
      {
        coerceTypes: false,
        removeAdditional: false,
      },
      silentValidateFn,
    );

    if (result.valid === true) {
      return rule;
    }
  }
}

const keyword: IKeyword = {
  name: 'anyOf',
  compile(compile, schema: ISchema[], parentSchema) {
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
      validate(ref, options, validateRuleFn) {
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
