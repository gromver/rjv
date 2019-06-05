import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule, { ValidateRuleFn } from '../interfaces/IRule';
import Ref from '../Ref';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';

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
      async validate(ref: Ref, validateRuleFn: ValidateRuleFn)
        : Promise<IRuleValidationResult> {
        if (ref.checkDataType('object')) {
          const value = ref.get();
          const invalidProperties: string[] = [];

          for (const propName of required) {
            const propRef = ref.relativeRef([propName]);

            await validateRuleFn(propRef, propRequiredRule);

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

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    required?: string[];
  }
}
