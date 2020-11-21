import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, CompileFn, IRule, IRef, RuleValidationResult,
} from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'pattern',
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    if (typeof schema !== 'string') {
      throw new Error('The schema of the "pattern" keyword should be a string.');
    }

    const regexp = new RegExp(schema);

    return {
      async validate(ref: IRef): Promise<RuleValidationResult> {
        const value = ref.value;
        if (utils.checkDataType('string', value)) {
          if (!regexp.test(value)) {
            return utils.createErrorResult(
              new ValidationMessage(
                false,
                keyword.name,
                'Should match pattern {pattern}',
                { pattern: schema },
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
    pattern?: string;
  }
}
