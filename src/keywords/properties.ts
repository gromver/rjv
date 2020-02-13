import Ref from '../Ref';
import {
  ISchema, IKeyword, CompileFn, IRule, ValidateRuleFn, IRuleValidationResult,
} from '../types';
import utils from '../utils';

type PropertiesSchema = { [propertyName: string]: ISchema };

const keyword: IKeyword = {
  name: 'properties',
  reserveNames: [
    'additionalProperties',
    'removeAdditional',
    'patternProperties',    // todo
    'propertyNames',        // todo
  ],
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

    const removeAdditional = !!parentSchema.removeAdditional;

    const validate = async (ref: Ref, validateRuleFn: ValidateRuleFn, options)
      : Promise<IRuleValidationResult> => {
      const invalidProperties: string[] = [];
      let hasValidProps = false;
      let hasInvalidProps = false;

      // function getValidatePropertiesJobs() {
      //   return Object.keys(properties).map((propName) => {
      //     const propRule = properties[propName];
      //     const propRef = ref.ref(propName);
      //     return validateRuleFn(propRef, propRule, options);
      //   });
      // }
      //
      // function getValidateAdditionalPropertiesJobs() {
      //   const value = ref.getValue();
      //   const valueProps = Object.keys(value);
      //
      //   return valueProps.map(async (propName) => {
      //     if (additionalRule) {
      //       const propRef = ref.ref(propName);
      //
      //       const result = await validateRuleFn(propRef, additionalRule, options);
      //     }
      //     const propRule = properties[propName];
      //     const propRef = ref.ref(propName);
      //     return validateRuleFn(propRef, propRule, options);
      //   });
      // }

      if (ref.checkDataType('object')) {
        for (const propName in properties) {
          const propRule = properties[propName];
          const propRef = ref.ref(propName);

          const result = await validateRuleFn(propRef, propRule, options);

          if (result.valid === true) {
            hasValidProps = true;
          } else if (result.valid === false) {
            hasInvalidProps = true;
            invalidProperties.push(propName);
          }
        }
        // const jobs = getValidatePropertiesJobs();

        // check additional props
        if (!allowAdditional) {
          const value = ref.getValue();
          const valueProps = Object.keys(value);

          for (const propName of valueProps) {
            if (!Object.prototype.hasOwnProperty.call(properties, propName)) {
              if (additionalRule) {
                const propRef = ref.ref(propName);

                const result = await validateRuleFn(propRef, additionalRule, options);

                if (result.valid === true) {
                  hasValidProps = true;
                } else if (result.valid === false) {
                  if (removeAdditional || options.removeAdditional) {
                    // remove prop
                    delete value[propName];
                  } else {
                    hasInvalidProps = true;
                    invalidProperties.push(propName);
                  }
                }
              } else {
                if (removeAdditional || options.removeAdditional) {
                  // remove prop
                  delete value[propName];
                } else {
                  hasInvalidProps = true;
                  invalidProperties.push(propName);
                }
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

declare module '../types' {
  export interface ISchema {
    properties?: PropertiesSchema;
    additionalProperties?: boolean | ISchema;
    removeAdditional?: boolean;
  }
}
