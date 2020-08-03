import Ref from '../Ref';
import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, CompileFn, IRule, IRuleValidationResult,
} from '../types';

const keyword: IKeyword = {
  name: 'maxProperties',
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    const limit = schema;

    if (typeof limit !== 'number') {
      throw new Error('The schema of the "maxProperties" keyword should be a number.');
    }

    if (limit < 0) {
      throw new Error('The "maxProperties" keyword can\'t be less then 0.');
    }

    return {
      async validate(ref: Ref): Promise<IRuleValidationResult> {
        if (ref.checkDataType('object')) {
          const value = ref.getValue();

          const metadata: IRuleValidationResult = {
            maxProperties: limit,
          };

          if (Object.values(value).length > limit) {
            return ref.createErrorResult(
              new ValidationMessage(
                keyword.name,
                `Should not have more than ${limit} properties`,
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
    maxProperties?: number;
  }

  export interface IRuleValidationResult {
    maxProperties?: number;
  }
}
