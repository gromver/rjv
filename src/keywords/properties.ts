import ValidationResult from '../ValidationResult';
import { ISchema, IKeyword, ValidateFn } from '../types';
import utils from '../utils';

type PropertiesSchema = { [propertyName: string]: ISchema };

const keyword: IKeyword = {
  name: 'properties',
  reserveNames: [
    'additionalProperties',
    'patternProperties',    // todo
    'propertyNames',        // todo
  ],
  compile(compile, schema: PropertiesSchema, parentSchema) {
    if (!utils.isObject(schema)) {
      throw new Error('The schema of the "properties" keyword should be an object.');
    }

    const properties: { [prop: string]: ValidateFn } = {};

    Object.entries(schema).forEach(([propName, propSchema]) => {
      if (!utils.isObject(propSchema)) {
        throw new Error(`Property "${propName}" should has a schema object.`);
      }

      properties[propName] = compile(propSchema, parentSchema); // all rules have validate() fn
    });

    const allowAdditional =
      parentSchema.additionalProperties === undefined
      || parentSchema.additionalProperties === true;

    let additionalRule: ValidateFn;

    if (utils.isObject(parentSchema.additionalProperties)) {
      additionalRule = compile(parentSchema.additionalProperties, parentSchema);
    }

    const removeAdditional = !!parentSchema.removeAdditional;

    return async (ref, options, applyValidateFn) => {
      const invalidProperties: string[] = [];
      let hasValidProps = false;
      let hasInvalidProps = false;

      if (utils.checkDataType('object', ref.value)) {
        for (const propName in properties) {
          const propRule = properties[propName];
          const propRef = ref.ref(propName);

          const result = await applyValidateFn(propRef, propRule, options);

          if (result) {
            if (result.valid) {
              hasValidProps = true;
            } else {
              hasInvalidProps = true;
              invalidProperties.push(propName);
            }
          }
        }

        // check additional props
        if (!allowAdditional) {
          const value = ref.value;
          const valueProps = Object.keys(value);
          const removeProps: string[] = [];

          for (const propName of valueProps) {
            if (!Object.prototype.hasOwnProperty.call(properties, propName)) {
              if (additionalRule) {
                const propRef = ref.ref(propName);

                const result = await applyValidateFn(propRef, additionalRule, options);

                if (result) {
                  if (result.valid) {
                    hasValidProps = true;
                  } else {
                    if (removeAdditional || options.removeAdditional) {
                      // store prop to remove later
                      removeProps.push(propName);
                    } else {
                      hasInvalidProps = true;
                      invalidProperties.push(propName);
                    }
                  }
                }
              } else {
                if (removeAdditional || options.removeAdditional) {
                  // store prop to remove later
                  removeProps.push(propName);
                } else {
                  hasInvalidProps = true;
                  invalidProperties.push(propName);
                }
              }
            }
          }

          // replace current value with new one without invalid additional props
          if (removeProps.length) {
            const cleanedValue = {};

            valueProps.forEach((prop) => {
              if (removeProps.indexOf(prop) === -1) {
                cleanedValue[prop] = value[prop];
              }
            });

            ref.value = cleanedValue;
          }
        }

        if (hasInvalidProps) {
          return new ValidationResult(
            false,
            'Should have valid properties',
            keyword.name,
            { invalidProperties },
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
    properties?: PropertiesSchema;
    additionalProperties?: boolean | ISchema;
  }
}
