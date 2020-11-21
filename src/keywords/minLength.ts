import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, CompileFn, IRule, IRef, RuleValidationResult,
} from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'minLength',
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    const limit = schema;

    if (typeof limit !== 'number') {
      throw new Error('The schema of the "minLength" keyword should be a number.');
    }

    if (limit < 1) {
      throw new Error('The "minLength" keyword can\'t be less then 1.');
    }

    return {
      async validate(ref: IRef): Promise<RuleValidationResult> {
        const value = ref.value;

        if (utils.checkDataType('string', value)) {
          if (value.length < limit) {
            return utils.createErrorResult(
              new ValidationMessage(
                false,
                keyword.name,
                'Should not be shorter than {limit} characters',
                { limit },
              ),
            );
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
    minLength?: number;
  }
}
