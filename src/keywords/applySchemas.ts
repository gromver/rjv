import {
  ISchema,
  IKeyword,
  CompileFn,
  IRule,
  IRef,
  ValidateRuleFn,
  RuleValidationResult,
  IRuleValidationResult,
} from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'applySchemas',
  compile(compile: CompileFn, schema: ISchema[], parentSchema: ISchema): IRule {
    if (!Array.isArray(schema)) {
      throw new Error('The schema of the "applySchemas" keyword should be an array of schemas.');
    }

    const rules: IRule[] = [];

    schema.forEach((item) => {
      if (!utils.isObject(item)) {
        throw new Error('Items of "applySchemas" keyword should be a schema object.');
      }

      rules.push(compile(item, parentSchema));  // all rules have validate() fn
    });

    const validate = async (ref: IRef, validateRuleFn: ValidateRuleFn, options)
      : Promise<RuleValidationResult> => {
      const results: IRuleValidationResult[] = [];

      for (const rule of rules) {
        const res = await validateRuleFn(ref, rule, options);

        res && results.push(res);
      }

      if (results.length) {
        return utils.mergeResults(results);
      }

      return undefined;
    };

    return {
      validate,
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    applySchemas?: ISchema[];
  }
}
