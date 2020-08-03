import Ref from '../Ref';
import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, CompileFn, IRule, ValidateRuleFn, IRuleValidationResult, ValueType,
} from '../types';

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
    let types: ValueType[] = [];
    const data = schema.data ? schema.data : schema;

    if (typeof data === 'string') {
      types = [data as ValueType];
    } else if (Array.isArray(data)) {
      types = data;
    }

    const coerceTypes = !!parentSchema.coerceTypes;

    return {
      async validate(ref: Ref, validateRuleFn: ValidateRuleFn, options)
        : Promise<IRuleValidationResult> {
        const curValue = ref.getValue();
        const curType = getValueType(curValue);

        if (curValue === undefined) {
          return Promise.resolve(ref.createUndefinedResult());
        }

        const valid = types.some((type) => {
          if (!ref.checkDataType(type)) {
            // try to coerce type
            if (coerceTypes || options.coerceTypes) {
              switch (type) {
                case 'string':
                  if (curType === 'number' || curType === 'boolean') {
                    ref.setValue(`${curValue}`);
                  }
                  break;

                case 'number':
                  if (
                    curType === 'boolean' || curValue === null
                    // tslint:disable-next-line:triple-equals
                    || (curType === 'string' && curValue && curValue == +curValue)
                  ) {
                    ref.setValue(+curValue);
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
                    ref.setValue(+curValue);
                  }
                  break;

                case 'boolean':
                  if (curValue === 'false' || curValue === 0 || curValue === null) {
                    ref.setValue(false);
                  } else if (curValue === 'true' || curValue === 1) {
                    ref.setValue(true);
                  }
                  break;

                case 'null':
                  if (curValue === '' || curValue === 0 || curValue === false) {
                    ref.setValue(null);
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
          : ref.createErrorResult(new ValidationMessage(
            keyword.name,
            `Should be ${typesAsString}`,
            { types, typesAsString },
          ));
      },
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    type?: string | string[];
    coerceTypes?: boolean;
  }
}
