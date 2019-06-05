import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule, { ValidateRuleFn } from '../interfaces/IRule';
import Ref from '../Ref';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
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

    const validate = async (ref: Ref, validateRuleFn: ValidateRuleFn)
      : Promise<IRuleValidationResult> => {
      const results: IRuleValidationResult[] = [];
      const invalidIndexes: number[] = [];
      const value = ref.get() as [];
      let hasValidProps = false;
      let hasInvalidProps = false;
      let hasItemsOverflow = false;

      if (ref.checkDataType('array')) {
        if (Array.isArray(rule)) {
          for (const index in rule) {
            const itemRule = rule[index];

            if (itemRule.validate) {
              const res = await validateRuleFn(
                ref.relativeRef([index]), itemRule,
              ) as IRuleValidationResult;

              results.push(res);
            }
          }

          // check additional items
          if (value.length > rule.length) {
            if (noAdditional) {
              hasItemsOverflow = true;
            } else if (additionalRule) {
              for (let i = value.length - 1; i < value.length; i += 1) {
                const res = await validateRuleFn(
                  ref.relativeRef([i]), additionalRule,
                ) as IRuleValidationResult;

                results.push(res);
              }
            }
          }
        } else {
          for (const index in value) {
            if (rule.validate) {
              const res = await validateRuleFn(
                ref.relativeRef([index]), rule as IRule,
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
            keyword: keyword.name,
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

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    items?: ISchema | ISchema[];
    additionalItems?: boolean | ISchema;
  }
}
