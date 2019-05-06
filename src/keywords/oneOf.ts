import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule, { ValidateAttributeFn } from '../interfaces/IRule';
import Ref from '../Ref';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
import utils from '../utils';

const validateFn: ValidateAttributeFn = (ref: Ref, rule: IRule): Promise<IRuleValidationResult> => {
  return rule.validate
    ? rule.validate(ref, validateFn)
    : Promise.resolve({});
};

const keyword: IKeyword = {
  name: 'oneOf',
  compile(compile: CompileFn, schema: ISchema[], parentSchema: ISchema): IRule {
    if (!Array.isArray(schema)) {
      throw new Error('The schema of the "oneOf" keyword should be an array of schemas.');
    }

    const rules: IRule[] = [];

    schema.forEach((item) => {
      if (!utils.isObject(item)) {
        throw new Error('Items of "oneOf" keyword should be a schema object.');
      }

      rules.push(compile(item, parentSchema));  // all rules have validate() fn
    });

    return {
      validate(ref: Ref, validateAttributeFn: ValidateAttributeFn): Promise<IRuleValidationResult> {
        const jobs: Promise<IRuleValidationResult>[] = rules
          .map(
            (rule) => (rule as any)
              .validate(ref, validateFn) as Promise<IRuleValidationResult>,
          );

        return Promise.all(jobs).then((results) => {
          const validRules: IRule[] = [];

          results.forEach((result, index) => {
            if (result.valid === true) {
              validRules.push(rules[index]);
            }
          });

          if (validRules.length === 1) {
            return validateAttributeFn(ref, validRules[0]);
          }

          return ref.createErrorResult({
            keyword: keyword.name,
            description: 'Should match exactly one schema in oneOf',
          });
        });
      },
    };
  },
};

export default keyword;

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    oneOf?: ISchema[];
  }
}