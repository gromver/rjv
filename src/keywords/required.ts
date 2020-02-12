import Ref from '../Ref';
import {
  ISchema, IKeyword, CompileFn, IRule, ValidateRuleFn, IRuleValidationResult,
} from '../types';

const keyword: IKeyword = {
  name: 'required',
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    const required: string[] = schema;

    if (!Array.isArray(required)) {
      throw new Error('The schema of the "required" keyword should be an array.');
    }

    const propRequiredRule: IRule = {
      validate(ref: Ref): Promise<IRuleValidationResult> {
        return Promise.resolve(ref.createUndefinedResult({
          required: true,
        }));
      },
    };

    return {
      async validate(ref: Ref, validateRuleFn: ValidateRuleFn, options)
        : Promise<IRuleValidationResult> {
        if (ref.checkDataType('object')) {
          const value = ref.getValue();
          const invalidProperties: string[] = [];

          for (const propName of required) {
            const propRef = ref.unsafeRef(propName);

            await validateRuleFn(propRef, propRequiredRule, options);

            if (!Object.prototype.hasOwnProperty.call(value, propName)) {
              invalidProperties.push(propName);
            }
          }

          if (invalidProperties.length) {
            return ref.createErrorResult({
              keyword: keyword.name,
              description: 'Should have all required properties',
              bindings: { invalidProperties },
            });
          }

          return ref.createSuccessResult();
        }

        return ref.createUndefinedResult();
      },
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    required?: string[];
  }
}
