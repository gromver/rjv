import ValidateFnResult from '../ValidateFnResult';
import utils from '../utils';
import { IKeyword, ValueType } from '../types';

/**
 * Like typeof but supports 'array' type
 * @param value
 */
function getValueType(value: any): string {
  const type = typeof value;

  if (type === 'object' && Array.isArray(type)) {
    return 'array';
  }

  return type;
}

const keyword: IKeyword = {
  name: 'type',
  reserveNames: ['coerceTypes'],
  compile(compile, schema: any, parentSchema) {
    // Type can be: number, integer, string, boolean, array, object or null.
    let types: ValueType[] = [];
    const data = schema.data ? schema.data : schema;

    if (typeof data === 'string') {
      types = [data as ValueType];
    } else if (Array.isArray(data)) {
      types = data;
    }

    const coerceTypes = !!parentSchema.coerceTypes;

    return async (ref, options) => {
      const curValue = ref.value;
      const curType = getValueType(curValue);

      if (curValue === undefined) {
        return Promise.resolve(undefined);
      }

      const valid = types.some((type) => {
        if (!utils.checkDataType(type, curValue)) {
          // try to coerce type
          if (coerceTypes || options.coerceTypes) {
            switch (type) {
              case 'string':
                if (curType === 'number' || curType === 'boolean') {
                  ref.value = `${curValue}`;
                }
                break;

              case 'number':
                if (
                  curType === 'boolean' || curValue === null
                  // tslint:disable-next-line:triple-equals
                  || (curType === 'string' && curValue && curValue == +curValue)
                ) {
                  ref.value = +curValue;
                }
                break;

              case 'integer':
                if (
                  curType === 'boolean' || curValue === null
                  || (
                    // tslint:disable-next-line:triple-equals
                    curType === 'string' && curValue && curValue == +curValue && !(curValue % 1)
                  )
                ) {
                  ref.value = +curValue;
                }
                break;

              case 'boolean':
                if (curValue === 'false' || curValue === 0 || curValue === null) {
                  ref.value = false;
                } else if (curValue === 'true' || curValue === 1) {
                  ref.value = true;
                }
                break;

              case 'null':
                if (curValue === '' || curValue === 0 || curValue === false) {
                  ref.value = null;
                }
                break;
            }

            // check type again
            return utils.checkDataType(type, ref.value);
          }

          return false;
        }

        return true;
      });

      const typesAsString = types.join(', ');

      return valid
        ? new ValidateFnResult(true)
        : new ValidateFnResult(
          false,
          'Should be {typesAsString}',
          keyword.name,
          { types, typesAsString },
        );
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    type?: ValueType | ValueType[];
    coerceTypes?: boolean;
  }
}
