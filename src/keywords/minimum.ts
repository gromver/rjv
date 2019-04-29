import Ref from '../Ref';
import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule from '../interfaces/IRule';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
import IStateMetadata from '../interfaces/IStateMetadata';

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
      validate(ref: Ref): IRuleValidationResult {
        if (ref.checkDataType('number')) {
          const value = ref.get();

          const metadata: IStateMetadata = {
            minimum: limit,
            exclusiveMinimum: exclusive,
          };

          if (exclusive ? value <= limit : value < limit) {
            return ref.createErrorResult(
              {
                keyword: keyword.name,
                description: exclusive
                  ? `Should be greater than ${limit}`
                  : `Should be greater than or equal ${limit}`,
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

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    minimum?: number;
    exclusiveMinimum?: boolean;
  }
}

declare module '../interfaces/IStateMetadata' {
  export default interface IStateMetadata {
    minimum?: number;
    exclusiveMinimum?: boolean;
  }
}
