import Ref from '../Ref';
import {
  ISchema, IKeyword, CompileFn, IRule, ValidateRuleFn, IRuleValidationResult,
} from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'contains',
  compile(compile: CompileFn, schema: ISchema, parentSchema: ISchema): IRule {
    if (!utils.isObject(schema)) {
      throw new Error('The schema of the "contains" keyword should be a schema object.');
    }

    const rule: IRule = compile(schema, parentSchema);

    const validate = async (ref: Ref, validateRuleFn: ValidateRuleFn, options)
      : Promise<IRuleValidationResult> => {
      const value = ref.getValue() as [];
      let hasValidItem = false;

      if (ref.checkDataType('array')) {
        for (const index in value) {
          if (rule.validate) {
            const res = await validateRuleFn(
              ref.unsafeRef(`${index}`), rule as IRule, options,
            ) as IRuleValidationResult;

            if (res.valid) {
              hasValidItem = true;
            }
          }
        }

        if (!hasValidItem) {
          return ref.createErrorResult({
            keyword: keyword.name,
            description: 'Should contain a valid item',
          });
        }

        return ref.createSuccessResult();
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
    contains?: ISchema;
  }
}
