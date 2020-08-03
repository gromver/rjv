import Ref from '../Ref';
import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, CompileFn, IRule, IRuleValidationResult,
} from '../types';

const keyword: IKeyword = {
  name: 'maxLength',
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    const limit = schema;

    if (typeof limit !== 'number') {
      throw new Error('The schema of the "maxLength" keyword should be a number.');
    }

    if (limit < 0) {
      throw new Error('The "maxLength" keyword can\'t be less then 0.');
    }

    return {
      async validate(ref: Ref): Promise<IRuleValidationResult> {
        if (ref.checkDataType('string')) {
          const value = ref.getValue();

          const metadata: IRuleValidationResult = {
            maxLength: limit,
          };

          if (value.length > limit) {
            return ref.createErrorResult(
              new ValidationMessage(
                keyword.name,
                `Should not be longer than ${limit} characters`,
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
    maxLength?: number;
  }

  export interface IRuleValidationResult {
    maxLength?: number;
  }
}
