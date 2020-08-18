import Ref from '../Ref';
import ValidationMessage from '../ValidationMessage';
import { ISchema, IKeyword, CompileFn, IRule, IRuleValidationResult } from '../types';

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
      async validate(ref: Ref): Promise<IRuleValidationResult> {
        if (ref.checkDataType('array')) {
          const value = ref.getValue();

          const metadata: IRuleValidationResult = {
            maxItems: limit,
          };

          if (value.length > limit) {
            return ref.createErrorResult(
              new ValidationMessage(
                keyword.name,
                'Should not have more than {limit} items',
                { limit },
              ),
              metadata,
            );
          }

          return ref.createSuccessResult(undefined, metadata);
        }

        return ref.createUndefinedResult();
      },
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    maxItems?: number;
  }

  export interface IRuleValidationResult {
    maxItems?: number;
  }
}
