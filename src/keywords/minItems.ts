import Ref from '../Ref';
import ValidationMessage from '../ValidationMessage';
import { ISchema, IKeyword, CompileFn, IRule, IRuleValidationResult } from '../types';

const keyword: IKeyword = {
  name: 'minItems',
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    const limit = schema;

    if (typeof limit !== 'number') {
      throw new Error('The schema of the "minItems" keyword should be a number.');
    }

    if (limit < 1) {
      throw new Error('The "minItems" keyword can\'t be less then 1.');
    }

    return {
      async validate(ref: Ref): Promise<IRuleValidationResult> {
        if (ref.checkDataType('array')) {
          const value = ref.getValue();

          const metadata: IRuleValidationResult = {
            minItems: limit,
          };

          if (value.length < limit) {
            return ref.createErrorResult(
              new ValidationMessage(
                keyword.name,
                'Should not have fewer than {limit} items',
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
    minItems?: number;
  }

  export interface IRuleValidationResult {
    minItems?: number;
  }
}
