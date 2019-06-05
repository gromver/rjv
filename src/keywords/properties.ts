import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule, { ValidateRuleFn } from '../interfaces/IRule';
import Ref from '../Ref';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
import utils from '../utils';

type PropertiesSchema = { [propertyName: string]: ISchema };

const keyword: IKeyword = {
  name: 'properties',
  reserveNames: [
    'additionalProperties',
    'removeAdditional',
    'patternProperties',
    'propertyNames',
  ], // todo
  compile(compile: CompileFn, schema: PropertiesSchema, parentSchema: ISchema): IRule {
    if (!utils.isObject(schema)) {
      throw new Error('The schema of the "properties" keyword should be an object.');
    }

    const properties: { [prop: string]: IRule } = {};

    Object.entries(schema).forEach(([propName, propSchema]) => {
      if (!utils.isObject(propSchema)) {
        throw new Error(`Property "${propName}" should has a schema object.`);
      }

      properties[propName] = compile(propSchema, parentSchema); // all rules have validate() fn
    });

    const allowAdditional =
      parentSchema.additionalProperties === undefined
      || parentSchema.additionalProperties === true;

    let additionalRule: IRule;

    if (utils.isObject(parentSchema.additionalProperties)) {
      additionalRule = compile(parentSchema.additionalProperties, parentSchema);
    }

    const validate = async (ref: Ref, validateRuleFn: ValidateRuleFn)
      : Promise<IRuleValidationResult> => {
      const invalidProperties: string[] = [];
      let hasValidProps = false;
      let hasInvalidProps = false;

      if (ref.checkDataType('object')) {
        for (const propName in properties) {
          const propRule = properties[propName];
          const propRef = ref.relativeRef([propName]);

          const result = await validateRuleFn(propRef, propRule);

          if (result.valid === true) {
            hasValidProps = true;
          } else if (result.valid === false) {
            hasInvalidProps = true;
            invalidProperties.push(propName);
          }
        }

        // check additional props
        if (!allowAdditional) {
          const valueProps = Object.keys(ref.get());

          for (const propName of valueProps) {
            if (!Object.prototype.hasOwnProperty.call(properties, propName)) {
              if (additionalRule) {
                const propRef = ref.relativeRef([propName]);

                const result = await validateRuleFn(propRef, additionalRule);

                if (result.valid === true) {
                  hasValidProps = true;
                } else if (result.valid === false) {
                  hasInvalidProps = true;
                  invalidProperties.push(propName);
                }
              } else {
                hasInvalidProps = true;
                invalidProperties.push(propName);
              }
            }
          }
        }

        if (hasInvalidProps) {
          return ref.createErrorResult({
            keyword: keyword.name,
            description: 'Should have valid properties',
            bindings: { invalidProperties },
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
    properties?: PropertiesSchema;
    additionalProperties?: boolean | ISchema;
  }
}
