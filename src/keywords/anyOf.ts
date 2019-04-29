import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule, { ValidateAttributeFn } from '../interfaces/IRule';
import Ref from '../Ref';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
import utils from '../utils';

const validateFn: ValidateAttributeFn = (ref: Ref, rule: IRule):
  IRuleValidationResult | Promise<IRuleValidationResult> => {
  return rule.validate ? rule.validate(ref, validateFn) : {};
};

async function findValidSchemaRule(rules: IRule[], ref: Ref) {
  for (let i = 0; i < rules.length; i += 1) {
    const rule = rules[i] as any;

    const result = await (rule.validate(ref, validateFn) as Promise<IRuleValidationResult>);

    if (result.valid === true) {
      return rule;
    }
  }
}

const keyword: IKeyword = {
  name: 'anyOf',
  compile(compile: CompileFn, schema: ISchema[], parentSchema: ISchema): IRule {
    if (!Array.isArray(schema)) {
      throw new Error('The schema of the "anyOf" keyword should be an array of schemas.');
    }

    const rules: IRule[] = [];

    schema.forEach((item) => {
      if (!utils.isObject(item)) {
        throw new Error('Items of "anyOf" keyword should be a schema object.');
      }

      rules.push(compile(item, parentSchema));  // all rules have validate() fn
    });

    const async = rules.some((rule) => !!rule.async);

    return {
      async,
      validate(ref: Ref, validateAttributeFn: ValidateAttributeFn)
        : IRuleValidationResult | Promise<IRuleValidationResult> {
        // async flow
        if (async) {
          return findValidSchemaRule(rules, ref).then((rule) => {
            if (rule) {
              return validateAttributeFn(ref, rule);
            }

            return ref.createErrorResult({
              keyword: keyword.name,
              description: 'Should match some schema in anyOf',
            });
          });
        }

        // sync flow
        const validRule = rules
          .find((rule) => {
            const result = (rule as any).validate(ref, validateFn) as IRuleValidationResult;

            return result.valid === true;
          });

        if (validRule) {
          validateAttributeFn(ref, validRule);

          return ref.createSuccessResult();
        }

        return ref.createErrorResult({
          keyword: keyword.name,
          description: 'Should match some schema in anyOf',
        });
      },
    };
  },
};

export default keyword;

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    anyOf?: ISchema[];
  }
}
