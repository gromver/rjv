import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule, { ValidateRuleFn } from '../interfaces/IRule';
import Ref from '../Ref';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
import utils from '../utils';

const validateFn: ValidateRuleFn = (ref: Ref, rule: IRule): Promise<IRuleValidationResult> => {
  return rule.validate
    ? rule.validate(ref, validateFn)
    : Promise.resolve({});
};
validateFn.options = {
  coerceTypes: false,
  removeAdditional: false,
};

const keyword: IKeyword = {
  name: 'not',
  compile(compile: CompileFn, schema: ISchema, parentSchema: ISchema): IRule {
    if (!utils.isObject(schema)) {
      throw new Error('The value of the "not" keyword should be a schema object.');
    }

    const rule: IRule = compile(schema, parentSchema);  // all rules have validate() fn

    return {
      validate(ref: Ref): Promise<IRuleValidationResult> {
        return ((rule as any)
          .validate(ref, validateFn) as Promise<IRuleValidationResult>)
          .then((result) => {
            if (result.valid === false) {
              return ref.createSuccessResult();
            }

            return ref.createErrorResult({
              keyword: keyword.name,
              description: 'Should not be valid',
            });
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
