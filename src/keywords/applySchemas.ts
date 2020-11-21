import { ISchema, IKeyword, IRule, IRuleValidationResult } from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'applySchemas',
  compile(compile, schema: ISchema[], parentSchema) {
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

    return {
      async validate(ref, options, validateRuleFn) {
        const results: IRuleValidationResult[] = [];

        for (const rule of rules) {
          const res = await validateRuleFn(ref, rule, options);

          res && results.push(res);
        }

        if (results.length) {
          return utils.mergeResults(results);
        }

        return undefined;
      },
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    applySchemas?: ISchema[];
  }
}
