import ValidateFnResult from '../ValidateFnResult';
import { ISchema, IKeyword, ValidateFn } from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'contains',
  compile(compile, schema: ISchema, parentSchema) {
    if (!utils.isObject(schema)) {
      throw new Error('The schema of the "contains" keyword should be a schema object.');
    }

    const validateFn: ValidateFn = compile(schema, parentSchema);

    return async (ref, options, applyValidateFn) => {
      const value = ref.value as [];
      let hasValidItem = false;

      if (utils.checkDataType('array', value)) {
        for (const index in value) {
          if (!value.hasOwnProperty(index)) continue;

          const res = await applyValidateFn(
            ref.ref(`${index}`), validateFn as ValidateFn, options,
          );

          if (res && res.valid) {
            hasValidItem = true;
          }
        }

        if (!hasValidItem) {
          return new ValidateFnResult(
            false,
            'Should contain a valid item',
            keyword.name,
          );
        }

        return new ValidateFnResult(true);
      }

      return undefined;
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    contains?: ISchema;
  }

  export interface ICustomErrors {
    contains?: string;
  }
}
