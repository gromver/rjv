import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule, { ValidateRuleFn } from '../interfaces/IRule';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
import Ref, { DataType } from '../Ref';

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
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    // Type can be: number, integer, string, boolean, array, object or null.
    let types: DataType[] = [];
    const data = schema.data ? schema.data : schema;

    if (typeof data === 'string') {
      types = [data as DataType];
    } else if (Array.isArray(data)) {
      types = data;
    }

    const coerceTypes = !!parentSchema.coerceTypes;

    return {
      async validate(ref: Ref, validateRuleFn: ValidateRuleFn)
        : Promise<IRuleValidationResult> {
        const curValue = ref.get();
        const curType = getValueType(curValue);

        if (curValue === undefined) {
          return Promise.resolve(ref.createUndefinedResult());
        }

        const valid = types.some((type) => {
          if (!ref.checkDataType(type)) {
            // try to coerce type
            if (coerceTypes || validateRuleFn.options.coerceTypes) {
              switch (type) {
                case 'string':
                  if (curType === 'number' || curType === 'boolean') {
                    ref.set(`${curValue}`, false);
                  }
                  break;

                case 'number':
                  if (
                    curType === 'boolean' || curValue === null
                    // tslint:disable-next-line:triple-equals
                    || (curType === 'string' && curValue && curValue == +curValue)
                  ) {
                    ref.set(+curValue, false);
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
                    ref.set(+curValue, false);
                  }
                  break;

                case 'boolean':
                  if (curValue === 'false' || curValue === 0 || curValue === null) {
                    ref.set(false, false);
                  } else if (curValue === 'true' || curValue === 1) {
                    ref.set(true, false);
                  }
                  break;

                case 'null':
                  if (curValue === '' || curValue === 0 || curValue === false) {
                    ref.set(null, false);
                  }
                  break;
              }

              // check type again
              return ref.checkDataType(type);
            }

            return false;
          }

          return true;
        });

        const typesAsString = types.join(', ');

        return valid
          ? ref.createSuccessResult()
          : ref.createErrorResult({
            keyword: keyword.name,
            description: `Should be ${typesAsString}`,
            bindings: { types, typesAsString },
          });
      },
    };
  },
};

export default keyword;

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    type?: string | string[];
    coerceTypes?: boolean;
  }
}
