import ValidationMessage from '../ValidationMessage';
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
  name: 'not',
  compile(compile, schema: ISchema, parentSchema) {
    if (!utils.isObject(schema)) {
      throw new Error('The value of the "not" keyword should be a schema object.');
    }

    const validateFn: ValidateFn = compile(schema, parentSchema);

    return (ref) => {
      return validateFn(
        ref,
        {
          coerceTypes: false,
          removeAdditional: false,
        },
        silentValidateFn,
      )
        .then((result) => {
          if (result && !result.valid) {
            return utils.createSuccessResult();
          }

          return utils.createErrorResult(new ValidationMessage(
            false,
            keyword.name,
            'Should not be valid',
          ));
        });
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    not?: ISchema;
  }
}
