import Ref from '../Ref';
import {
  ISchema, IKeyword, CompileFn, IRule, IRuleValidationResult,
} from '../types';

const keyword: IKeyword = {
  name: 'minProperties',
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    const limit = schema;

    if (typeof limit !== 'number') {
      throw new Error('The schema of the "minProperties" keyword should be a number.');
    }

    if (limit < 1) {
      throw new Error('The "minProperties" keyword can\'t be less then 1.');
    }

    return {
      async validate(ref: Ref): Promise<IRuleValidationResult> {
        if (ref.checkDataType('object')) {
          const value = ref.getValue();

          const metadata: IRuleValidationResult = {
            minProperties: limit,
          };

          if (Object.values(value).length < limit) {
            return ref.createErrorResult(
              {
                keyword: keyword.name,
                description: `Should not have fewer than ${limit} properties`,
                bindings: { limit },
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
    minProperties?: number;
  }

  export interface IRuleValidationResult {
    minProperties?: number;
  }
}
