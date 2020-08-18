import Ref from '../Ref';
import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, CompileFn, IRule, IRuleValidationResult,
} from '../types';

const keyword: IKeyword = {
  name: 'pattern',
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    if (typeof schema !== 'string') {
      throw new Error('The schema of the "pattern" keyword should be a string.');
    }

    const regexp = new RegExp(schema);

    return {
      async validate(ref: Ref): Promise<IRuleValidationResult> {
        if (ref.checkDataType('string')) {
          const value = ref.getValue();

          const metadata: IRuleValidationResult = {
            pattern: schema,
          };

          if (!regexp.test(value)) {
            return ref.createErrorResult(
              new ValidationMessage(
                keyword.name,
                'Should match pattern {pattern}',
                { pattern: schema },
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
    pattern?: string;
  }

  export interface IRuleValidationResult {
    pattern?: string;
  }
}
