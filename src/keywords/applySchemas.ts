import Ref from '../Ref';
import {
  ISchema, IKeyword, CompileFn, IRule, ValidateRuleFn, IRuleValidationResult,
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

    const validate = async (ref: Ref, validateRuleFn: ValidateRuleFn, options)
      : Promise<IRuleValidationResult> => {
      for (const rule of rules) {
        await validateRuleFn(ref, rule, options);
      }

      return ref.createUndefinedResult();
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
