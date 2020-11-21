import {
  ISchema, IKeyword, IRule, ValidateRuleFn, RuleValidationResult,
} from '../types';
import utils from '../utils';

const silentValidateFn: ValidateRuleFn = async (ref, rule) => {
  return rule.validate
    ? rule.validate(
      ref,
      {
        coerceTypes: false,
        removeAdditional: false,
      },
      silentValidateFn,
    )
    : undefined;
};

const keyword: IKeyword = {
  name: 'if',
  reserveNames: ['then', 'else'],
  compile(compile, schema: ISchema, parentSchema) {
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
      async validate(ref, options, validateRuleFn) {
        return (
          (ifRule as any).validate(
            ref,
            {
              coerceTypes: false,
              removeAdditional: false,
            },
            silentValidateFn,
          ) as Promise<RuleValidationResult>
        )
          .then((result) => {
            if (result) {
              if (!result.valid) {
                if (elseRule) {
                  return (elseRule as any).validate(ref, options, validateRuleFn);
                }
              } else {
                if (thenRule) {
                  return (thenRule as any).validate(ref, options, validateRuleFn);
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
