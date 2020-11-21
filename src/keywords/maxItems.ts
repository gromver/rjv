import ValidationMessage from '../ValidationMessage';
import { ISchema, IKeyword, CompileFn, IRule, IRef, RuleValidationResult } from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'maxItems',
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    const limit = schema;

    if (typeof limit !== 'number') {
      throw new Error('The schema of the "maxItems" keyword should be a number.');
    }

    if (limit < 0) {
      throw new Error('The "maxItems" keyword can\'t be less then 0.');
    }

    return {
      async validate(ref: IRef): Promise<RuleValidationResult> {
        const value = ref.value;

        if (utils.checkDataType('array', value)) {
          if (value.length > limit) {
            return utils.createErrorResult(
              new ValidationMessage(
                false,
                keyword.name,
                'Should not have more than {limit} items',
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
    maxItems?: number;
  }
}
