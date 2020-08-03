import Ref from '../Ref';
import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, CompileFn, IRule, IRuleValidationResult,
} from '../types';

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
      async validate(ref: Ref): Promise<IRuleValidationResult> {
        if (ref.checkDataType('number')) {
          const value = ref.getValue();

          const metadata: IRuleValidationResult = {
            minimum: limit,
            exclusiveMinimum: exclusive,
          };

          if (exclusive ? value <= limit : value < limit) {
            return ref.createErrorResult(
              new ValidationMessage(
                exclusive ? `${keyword.name}_exclusive` : keyword.name,
                exclusive
                  ? `Should be greater than ${limit}`
                  : `Should be greater than or equal ${limit}`,
                { limit, exclusive },
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
    minimum?: number;
    exclusiveMinimum?: boolean;
  }

  export interface IRuleValidationResult {
    minimum?: number;
    exclusiveMinimum?: boolean;
  }
}
