import {
  ISchema, IKeyword, CompileFn, IRule, IRef, ValidateRuleFn, RuleValidationResult,
} from '../types';
import utils from '../utils';

const validateFn: ValidateRuleFn = async (ref: IRef, rule: IRule)
  : Promise<RuleValidationResult> => {
  return rule.validate
    ? rule.validate(ref, validateFn, {
      coerceTypes: false,
      removeAdditional: false,
    })
    : undefined;
};

const keyword: IKeyword = {
  name: 'if',
  reserveNames: ['then', 'else'],
  compile(compile: CompileFn, schema: ISchema, parentSchema: ISchema): IRule {
    if (!utils.isObject(schema)) {
      throw new Error('The value of the "if" keyword should be a schema object.');
    }

    // all rules have validate() fn
    const ifRule: IRule = compile(schema, parentSchema);
    const thenRule: IRule | void = parentSchema.then && compile(parentSchema.then, parentSchema);
    const elseRule: IRule | void = parentSchema.else && compile(parentSchema.else, parentSchema);

    if (!(thenRule || elseRule)) {
      throw new Error(
        'For the "if" keyword You must specify at least the keyword "then" or "else".',
      );
    }

    return {
      async validate(ref: IRef, validateRuleFn: ValidateRuleFn, options)
        : Promise<RuleValidationResult> {
        return (
          (ifRule as any).validate(ref, validateFn, {
            coerceTypes: false,
            removeAdditional: false,
          }) as Promise<RuleValidationResult>
        )
          .then((result) => {
            if (result) {
              if (!result.valid) {
                if (elseRule) {
                  return (elseRule as any).validate(ref, validateRuleFn, options);
                }
              } else {
                if (thenRule) {
                  return (thenRule as any).validate(ref, validateRuleFn, options);
                }
              }
            }

            return undefined;
          });
      },
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    if?: ISchema;
    else?: ISchema;
    then?: ISchema;
  }
}
