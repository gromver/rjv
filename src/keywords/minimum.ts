import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, CompileFn, IRule, IRef, RuleValidationResult,
} from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'minimum',
  reserveNames: ['exclusiveMinimum'],
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    const limit = schema;
    const exclusive = (parentSchema as any).exclusiveMinimum || false;

    if (typeof limit !== 'number') {
      throw new Error('The schema of the "minimum" keyword should be a number.');
    }

    return {
      async validate(ref: IRef): Promise<RuleValidationResult> {
        const value = ref.value;

        if (utils.checkDataType('number', value)) {
          if (exclusive ? value <= limit : value < limit) {
            return utils.createErrorResult(
              new ValidationMessage(
                false,
                exclusive ? `${keyword.name}_exclusive` : keyword.name,
                exclusive
                  ? 'Should be greater than {limit}'
                  : 'Should be greater than or equal {limit}',
                { limit, exclusive },
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
    minimum?: number;
    exclusiveMinimum?: boolean;
  }
}
