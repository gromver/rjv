import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule, { ValidateAttributeFn } from '../interfaces/IRule';
import Ref from '../Ref';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
import utils from '../utils';

type PropertiesSchema = { [propertyName: string]: ISchema };

const keyword: IKeyword = {
  name: 'properties',
  reserveNames: ['additionalProperties', 'patternProperties', 'propertyNames'], // todo
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

    const propEntries = Object.entries(properties);

    let async = Object.values(properties).some((rule) => !!rule.async);

    const allowAdditional =
      parentSchema.additionalProperties === undefined
      || parentSchema.additionalProperties === true;

    let additionalRule: IRule;

    if (utils.isObject(parentSchema.additionalProperties)) {
      additionalRule = compile(parentSchema.additionalProperties, parentSchema);

      if (additionalRule.async) {
        async = true;
      }
    }

    let validate: (ref: Ref, validateAttributeFn: ValidateAttributeFn)
      => IRuleValidationResult | Promise<IRuleValidationResult>;

    if (async) {
      // async flow
      validate = async (ref, validateAttributeFn) => {
        const invalidProperties: string[] = [];
        let hasValidProps = false;
        let hasInvalidProps = false;

        if (ref.checkDataType('object')) {
          for (const propName in properties) {
            const propRule = properties[propName];
            const propRef = ref.relativeRef([propName]);

            const job = (
              propRule.async
                ? validateAttributeFn(propRef, propRule) as Promise<IRuleValidationResult>
                : Promise.resolve(validateAttributeFn(propRef, propRule) as IRuleValidationResult)
            );

            const result = await job;

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

                  const job = (
                    additionalRule.async
                      // tslint:disable-next-line:max-line-length
                      ? validateAttributeFn(propRef, additionalRule) as Promise<IRuleValidationResult>
                      // tslint:disable-next-line:max-line-length
                      : Promise.resolve(validateAttributeFn(propRef, additionalRule) as IRuleValidationResult)
                  );

                  const result = await job;

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
    } else {
      // sync flow
      validate = (ref, validateAttributeFn) => {
        const invalidProperties: string[] = [];
        let hasValidProps = false;
        let hasInvalidProps = false;

        if (ref.checkDataType('object')) {
          propEntries.forEach(([propName, propRule]) => {
            const propRef = ref.relativeRef([propName]);
            const result = validateAttributeFn(propRef, propRule) as IRuleValidationResult;

            if (result.valid === true) {
              hasValidProps = true;
            } else if (result.valid === false) {
              hasInvalidProps = true;
              invalidProperties.push(propName);
            }
          });

          // check additional props
          if (!allowAdditional) {
            Object.keys(ref.get()).forEach((propName) => {
              if (!Object.prototype.hasOwnProperty.call(properties, propName)) {
                if (additionalRule) {
                  const propRef = ref.relativeRef([propName]);

                  const result =
                    validateAttributeFn(propRef, additionalRule) as IRuleValidationResult;

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
            });
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
    }

    return {
      async,
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
