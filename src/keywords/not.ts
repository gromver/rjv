import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule, { ValidateAttributeFn } from '../interfaces/IRule';
import Ref from '../Ref';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'not',
  compile(compile: CompileFn, schema: ISchema, parentSchema: ISchema): IRule {
    if (!utils.isObject(schema)) {
      throw new Error('The value of the "not" keyword should be a schema object.');
    }

    const rule: IRule = compile(schema, parentSchema);  // all rules have validate() fn

    const async = !!rule.async;

    return {
      async,
      validate(ref: Ref, validateAttributeFn: ValidateAttributeFn)
        : IRuleValidationResult | Promise<IRuleValidationResult> {
        // async flow
        if (async) {
          return ((rule as any)
            .validate(ref, validateAttributeFn) as Promise<IRuleValidationResult>)
            .then((result) => {
              if (result.valid === false) {
                return ref.createSuccessResult();
              }

              return ref.createErrorResult({
                keyword: keyword.name,
                description: 'Should not be valid',
              });
            });
        }

        // sync flow
        const result = (rule as any).validate(ref, validateAttributeFn) as IRuleValidationResult;

        if (result.valid === false) {
          return ref.createSuccessResult();
        }

        return ref.createErrorResult({
          keyword: keyword.name,
          description: 'Should not be valid',
        });
      },
    };
  },
};

export default keyword;

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    not?: ISchema;
  }
}
