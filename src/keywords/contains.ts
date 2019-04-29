import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule, { ValidateAttributeFn } from '../interfaces/IRule';
import Ref from '../Ref';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'contains',
  compile(compile: CompileFn, schema: ISchema, parentSchema: ISchema): IRule {
    if (!utils.isObject(schema)) {
      throw new Error('The schema of the "contains" keyword should be a schema object.');
    }

    const rule: IRule = compile(schema, parentSchema);
    const async: boolean = !!rule.async;

    let validate: (ref: Ref, validateAttributeFn: ValidateAttributeFn)
      => IRuleValidationResult | Promise<IRuleValidationResult>;

    if (async) {
      validate = async (ref, validateAttributeFn) => {
        const value = ref.get() as [];
        let hasValidItem = false;

        if (ref.checkDataType('array')) {
          for (const index in value) {
            if (rule.validate) {
              const res = await validateAttributeFn(
                ref.relativeRef([index]), rule as IRule,
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
    } else {
      validate = (ref, validateAttributeFn) => {
        const value = ref.get() as [];
        let hasValidItem = false;

        if (ref.checkDataType('array')) {
          value.forEach((itemValue, index) => {
            const res = validateAttributeFn(
              ref.relativeRef([index]), rule as IRule,
            ) as IRuleValidationResult;

            if (res.valid) {
              hasValidItem = true;
            }
          });

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
    }

    return {
      async,
      validate,
    };
  },
};

export default keyword;

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    contains?: ISchema;
  }
}
