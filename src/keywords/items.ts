import Ref from '../Ref';
import {
  ISchema, IKeyword, CompileFn, IRule, ValidateRuleFn, IRuleValidationResult,
} from '../types';
import utils from '../utils';

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

    const validate = async (ref: Ref, validateRuleFn: ValidateRuleFn, options)
      : Promise<IRuleValidationResult> => {
      const results: IRuleValidationResult[] = [];
      const invalidIndexes: number[] = [];
      const value = ref.getValue() as [];
      let hasValidProps = false;
      let hasInvalidProps = false;
      let hasItemsOverflow = false;

      if (ref.checkDataType('array')) {
        if (Array.isArray(rule)) {
          for (const index in rule) {
            const itemRule = rule[index];

            if (itemRule.validate) {
              const res = await validateRuleFn(
                ref.ref(index), itemRule, options,
              ) as IRuleValidationResult;

              results.push(res);
            }
          }

          // check additional items
          if (value.length > rule.length) {
            if (noAdditional && !removeAdditional && !options.removeAdditional) {
              hasItemsOverflow = true;
            } else if (additionalRule) {
              const removeIndices: number[] = [];

              for (let i = rule.length; i < value.length; i += 1) {
                const res = await validateRuleFn(
                  ref.ref(`${i}`), additionalRule, options,
                ) as IRuleValidationResult;

                if (res.valid === false && removeAdditional) {
                  removeIndices.push(i);
                } else {
                  results.push(res);
                }
              }

              ref.setValue(value.filter((v, i) => removeIndices.indexOf(i) === -1));
            } else if (removeAdditional || options.removeAdditional) {
              ref.setValue(value.slice(0, rule.length));
            }
          }
        } else {
          for (const index in value) {
            if (rule.validate) {
              const res = await validateRuleFn(
                ref.ref(`${index}`), rule as IRule, options,
              ) as IRuleValidationResult;

              results.push(res);
            }
          }
        }

        results.forEach((result, index) => {
          if (result.valid === true) {
            hasValidProps = true;
          } else if (result.valid === false) {
            hasInvalidProps = true;
            invalidIndexes.push(index);
          }
        });

        if (hasInvalidProps) {
          return ref.createErrorResult({
            keyword: keyword.name,
            description: 'Should have valid items',
            bindings: { invalidIndexes },
          });
        }

        if (hasItemsOverflow) {
          const limit = (rule as IRule[]).length;

          return ref.createErrorResult({
            keyword: `${keyword.name}_overflow`,
            description: `Should not have more than ${limit} items`,
            bindings: { limit },
          });
        }

        if (hasValidProps) {
          return ref.createSuccessResult();
        }
      }

      return ref.createUndefinedResult();
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
