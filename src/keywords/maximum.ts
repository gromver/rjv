import Ref from '../Ref';
import {
  ISchema, IKeyword, CompileFn, IRule, IRuleValidationResult,
} from '../types';

const keyword: IKeyword = {
  name: 'maximum',
  reserveNames: ['exclusiveMaximum'],
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    const limit = schema;
    const exclusive = (parentSchema as any).exclusiveMaximum || false;

    if (typeof limit !== 'number') {
      throw new Error('The schema of the "maximum" keyword should be a number.');
    }

    return {
      async validate(ref: Ref): Promise<IRuleValidationResult> {
        if (ref.checkDataType('number')) {
          const value = ref.getValue();

          const metadata: IRuleValidationResult = {
            maximum: limit,
            exclusiveMaximum: exclusive,
          };

          if (exclusive ? value >= limit : value > limit) {
            return ref.createErrorResult(
              {
                keyword: exclusive ? `${keyword.name}_exclusive` : keyword.name,
                description: exclusive
                  ? `Should be less than ${limit}`
                  : `Should be less than or equal ${limit}`,
                bindings: { limit, exclusive },
              },
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
    maximum?: number;
    exclusiveMaximum?: boolean;
  }

  export interface IRuleValidationResult {
    maximum?: number;
    exclusiveMaximum?: boolean;
  }
}
