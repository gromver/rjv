import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, CompileFn, IRule, IRef, ValidateRuleFn, RuleValidationResult,
} from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'contains',
  compile(compile: CompileFn, schema: ISchema, parentSchema: ISchema): IRule {
    if (!utils.isObject(schema)) {
      throw new Error('The schema of the "contains" keyword should be a schema object.');
    }

    const rule: IRule = compile(schema, parentSchema);

    const validate = async (ref: IRef, validateRuleFn: ValidateRuleFn, options)
      : Promise<RuleValidationResult> => {
      const value = ref.value as [];
      let hasValidItem = false;

      if (utils.checkDataType('array', value)) {
        for (const index in value) {
          if (rule.validate) {
            const res = await validateRuleFn(
              ref.ref(`${index}`), rule as IRule, options,
            );

            if (res && res.valid) {
              hasValidItem = true;
            }
          }
        }

        if (!hasValidItem) {
          return utils.createErrorResult(new ValidationMessage(
            false,
            keyword.name,
            'Should contain a valid item',
          ));
        }

        return utils.createSuccessResult();
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
    contains?: ISchema;
  }
}
