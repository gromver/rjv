import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, IRule, RuleValidationResult, RuleValidateFn,
} from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'allOf',
  compile(compile, schema: ISchema[], parentSchema) {
    if (!Array.isArray(schema)) {
      throw new Error('The schema of the "allOf" keyword should be an array of schemas.');
    }

    const rules: IRule[] = [];

    schema.forEach((item) => {
      if (!utils.isObject(item)) {
        throw new Error('Items of "allOf" keyword should be a schema object.');
      }

      rules.push(compile(item, parentSchema));  // all rules have validate() fn
    });

    const validate: RuleValidateFn = async (ref, options, validateRuleFn) => {
      const results: (RuleValidationResult)[] = [];

      for (const rule of rules) {
        const res = await validateRuleFn(ref, rule, options);
        results.push(res);
      }

      const validRules = results.filter((result) => result && result.valid).length;

      if (validRules === results.length) {
        return utils.createSuccessResult();
      }

      return utils.createErrorResult(new ValidationMessage(
        false,
        keyword.name,
        'Should match all schema in allOf',
      ));
    };

    return {
      validate,
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    allOf?: ISchema[];
  }
}
