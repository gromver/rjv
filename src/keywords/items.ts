import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, CompileFn, IRule, IRef, ValidateRuleFn, RuleValidationResult,
} from '../types';
import utils from '../utils';

const silentValidateFn: ValidateRuleFn = async (ref: IRef, rule: IRule)
  : Promise<RuleValidationResult> => {
  return rule.validate
    ? rule.validate(ref, silentValidateFn, {
      coerceTypes: false,
      removeAdditional: false,
    })
    : undefined;
};

const keyword: IKeyword = {
  name: 'items',
  reserveNames: ['additionalItems'],
  compile(compile: CompileFn, schema: ISchema | ISchema[], parentSchema: ISchema): IRule {
    if (!utils.isObject(schema) && !Array.isArray(schema)) {
      throw new Error('The schema of the "items" keyword should be an object or array of schemas.');
    }

    let rule: IRule | IRule[] = [];

    if (Array.isArray(schema)) {
      schema.forEach((itemSchema) => {
        if (!utils.isObject(itemSchema)) {
          throw new Error('Each item of the "items" keyword should be a schema object.');
        }

        (rule as IRule[]).push(compile(itemSchema, parentSchema));
      });
    } else {
      rule = compile(schema, parentSchema);
    }

    // additionalItems
    const noAdditional = parentSchema.additionalItems === false;

    let additionalRule: IRule;

    if (utils.isObject(parentSchema.additionalItems)) {
      additionalRule = compile(parentSchema.additionalItems, parentSchema);
    }

    const removeAdditional = !!parentSchema.removeAdditional;

    const validate = async (ref: IRef, validateRuleFn: ValidateRuleFn, options)
      : Promise<RuleValidationResult> => {
      const results: (RuleValidationResult)[] = [];
      const invalidIndexes: number[] = [];
      const value = ref.value as [];
      let hasValidProps = false;
      let hasInvalidProps = false;
      let hasItemsOverflow = false;

      if (utils.checkDataType('array', value)) {
        if (Array.isArray(rule)) {
          for (const index in rule) {
            const itemRule = rule[index];

            if (itemRule.validate) {
              const res = await validateRuleFn(
                ref.ref(index), itemRule, options,
              );

              results.push(res);
            }
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
                const res = await validateRuleFn(
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
            if (rule.validate) {
              const res = await validateRuleFn(
                ref.ref(`${index}`), rule as IRule, options,
              );

              results.push(res);
            }
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
          return utils.createErrorResult(new ValidationMessage(
            false,
            keyword.name,
            'Should have valid items',
            { invalidIndexes },
          ));
        }

        if (hasItemsOverflow) {
          const limit = (rule as IRule[]).length;

          return utils.createErrorResult(new ValidationMessage(
            false,
            `${keyword.name}_overflow`,
            'Should not have more than {limit} items',
            { limit },
          ));
        }

        if (hasValidProps) {
          return utils.createSuccessResult();
        }
      }

      return undefined;
    };

    return {
      validate,
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
