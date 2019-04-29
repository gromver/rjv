import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule, { ValidateAttributeFn } from '../interfaces/IRule';
import Ref from '../Ref';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'allOf',
  compile(compile: CompileFn, schema: ISchema[], parentSchema: ISchema): IRule {
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

    const async = rules.some((rule) => !!rule.async);

    let validate: (ref: Ref, validateAttributeFn: ValidateAttributeFn)
      => IRuleValidationResult | Promise<IRuleValidationResult>;

    if (async) {
      validate = async (ref, validateAttributeFn) => {
        const results: IRuleValidationResult[] = [];

        for (const rule of rules) {
          const res = await (rule as any)
            .validate(ref, validateAttributeFn) as IRuleValidationResult;
          results.push(res);
        }

        const validRules = results.filter((result) => result.valid === true).length;

        if (validRules === results.length) {
          return ref.createSuccessResult();
        }

        return ref.createErrorResult({
          keyword: keyword.name,
          description: 'Should match all schema in allOf',
        });
      };
    } else {
      validate = (ref, validateAttributeFn) => {
        const results = rules
          .map((rule) => (rule as any).validate(ref, validateAttributeFn) as IRuleValidationResult);

        const validRules = results.filter((result) => result.valid === true);

        if (validRules.length === results.length) {
          return ref.createSuccessResult();
        }

        return ref.createErrorResult({
          keyword: keyword.name,
          description: 'Should match all schema in allOf',
        });
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
    allOf?: ISchema[];
  }
}
