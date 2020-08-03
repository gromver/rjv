import Ref from '../Ref';
import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, CompileFn, IRule, IRuleValidationResult,
} from '../types';

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
      async validate(ref: Ref): Promise<IRuleValidationResult> {
        if (ref.checkDataType('string')) {
          const value = ref.getValue();

          const metadata: IRuleValidationResult = {
            minLength: limit,
          };

          if (value.length < limit) {
            return ref.createErrorResult(
              new ValidationMessage(
                keyword.name,
                'Should not be shorter than {limit} characters',
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
    minLength?: number;
  }

  export interface IRuleValidationResult {
    minLength?: number;
  }
}
