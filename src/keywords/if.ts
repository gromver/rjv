import {
  ISchema, IKeyword, ValidateFn, ApplyValidateFn,
} from '../types';
import utils from '../utils';

const silentValidateFn: ApplyValidateFn = async (ref, validateFn) => {
  return validateFn(
    ref,
    {
      coerceTypes: false,
      removeAdditional: false,
    },
    silentValidateFn,
  );
};

const keyword: IKeyword = {
  name: 'if',
  reserveNames: ['then', 'else'],
  compile(compile, schema: ISchema, parentSchema) {
    if (!utils.isObject(schema)) {
      throw new Error('The value of the "if" keyword should be a schema object.');
    }

    // all rules have validate() fn
    const ifRule: ValidateFn = compile(schema, parentSchema);
    const thenRule: ValidateFn | void =
      parentSchema.then && compile(parentSchema.then, parentSchema);
    const elseRule: ValidateFn | void =
      parentSchema.else && compile(parentSchema.else, parentSchema);

    if (!(thenRule || elseRule)) {
      throw new Error(
        'For the "if" keyword You must specify at least the keyword "then" or "else".',
      );
    }

    return async (ref, options, applyValidateFn) => {
      return ifRule(
        ref,
        {
          coerceTypes: false,
          removeAdditional: false,
        },
        silentValidateFn,
      )
        .then((result) => {
          if (result) {
            if (!result.valid) {
              if (elseRule) {
                return elseRule(ref, options, applyValidateFn);
              }
            } else {
              if (thenRule) {
                return thenRule(ref, options, applyValidateFn);
              }
            }
          }

          return undefined;
        });
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
