import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, CompileFn, IRule, IRef, ValidateRuleFn, RuleValidationResult,
} from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'required',
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    const required: string[] = schema;

    if (!Array.isArray(required)) {
      throw new Error('The schema of the "required" keyword should be an array.');
    }

    return {
      async validate(ref: IRef, validateRuleFn: ValidateRuleFn, options)
        : Promise<RuleValidationResult> {
        if (utils.checkDataType('object', ref.value)) {
          const value = ref.value;
          const invalidProperties: string[] = [];

          for (const propName of required) {
            if (!Object.prototype.hasOwnProperty.call(value, propName)) {
              invalidProperties.push(propName);
            }
          }

          if (invalidProperties.length) {
            return utils.createErrorResult(new ValidationMessage(
              false,
              keyword.name,
              'Should have all required properties',
              { invalidProperties },
            ));
          }

          return utils.createSuccessResult();
        }

        return undefined;
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
