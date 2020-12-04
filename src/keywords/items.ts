import ValidationResult from '../ValidationResult';
import {
  ISchema, IKeyword, ValidateFn, ApplyValidateFn, ValidateFnResult,
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
  name: 'items',
  reserveNames: ['additionalItems'],
  compile(compile, schema: ISchema | ISchema[], parentSchema) {
    if (!utils.isObject(schema) && !Array.isArray(schema)) {
      throw new Error('The schema of the "items" keyword should be an object or array of schemas.');
    }

    let rule: ValidateFn | ValidateFn[] = [];

    if (Array.isArray(schema)) {
      schema.forEach((itemSchema) => {
        if (!utils.isObject(itemSchema)) {
          throw new Error('Each item of the "items" keyword should be a schema object.');
        }

        (rule as ValidateFn[]).push(compile(itemSchema, parentSchema));
      });
    } else {
      rule = compile(schema, parentSchema);
    }

    // additionalItems
    const noAdditional = parentSchema.additionalItems === false;

    let additionalRule: ValidateFn;

    if (utils.isObject(parentSchema.additionalItems)) {
      additionalRule = compile(parentSchema.additionalItems, parentSchema);
    }

    const removeAdditional = !!parentSchema.removeAdditional;

    return async (ref, options, applyValidateFn) => {
      const results: (ValidateFnResult)[] = [];
      const invalidIndexes: number[] = [];
      const value = ref.value as [];
      let hasValidProps = false;
      let hasInvalidProps = false;
      let hasItemsOverflow = false;

      if (utils.checkDataType('array', value)) {
        if (Array.isArray(rule)) {
          for (const index in rule) {
            const itemRule = rule[index];

            const res = await applyValidateFn(
              ref.ref(index), itemRule, options,
            );

            results.push(res);
          }

          // check additional items
          if (value.length > rule.length) {
            if (noAdditional && !removeAdditional && !options.removeAdditional) {
              hasItemsOverflow = true;
            } else if (additionalRule) {
              if (removeAdditional) {
                const removeIndices: number[] = [];

                for (let i = rule.length; i < value.length; i += 1) {
                  // just need to know is value valid
                  const preValidationRes = await silentValidateFn(
                    ref.ref(`${i}`), additionalRule, options,
                  );

                  if (preValidationRes === undefined || !preValidationRes.valid) {
                    removeIndices.push(i);
                  }
                }

                ref.value = value.filter((v, i) => !removeIndices.includes(i));
              }

              // now check items without wrong additional items
              for (let i = rule.length; i < value.length; i += 1) {
                const res = await applyValidateFn(
                  ref.ref(`${i}`), additionalRule, options,
                );

                results.push(res);
              }
            } else if (removeAdditional || options.removeAdditional) {
              ref.value = value.slice(0, rule.length);
            }
          }
        } else {
          for (const index in value) {
            const res = await applyValidateFn(
              ref.ref(`${index}`), rule as ValidateFn, options,
            );

            results.push(res);
          }
        }

        results.forEach((result, index) => {
          if (result) {
            if (result.valid) {
              hasValidProps = true;
            } else {
              hasInvalidProps = true;
              invalidIndexes.push(index);
            }
          }
        });

        if (hasInvalidProps) {
          return new ValidationResult(
            false,
            'Should have valid items',
            keyword.name,
            { invalidIndexes },
          );
        }

        if (hasItemsOverflow) {
          const limit = (rule as ValidateFn[]).length;

          return new ValidationResult(
            false,
            'Should not have more than {limit} items',
            `${keyword.name}_overflow`,
            { limit },
          );
        }

        if (hasValidProps) {
          return new ValidationResult(true);
        }
      }

      return undefined;
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    items?: ISchema | ISchema[];
    additionalItems?: boolean | ISchema;
  }
}
