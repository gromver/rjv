import Ref from '../Ref';
import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule from '../interfaces/IRule';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
import IStateMetadata from '../interfaces/IStateMetadata';

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
      validate(ref: Ref): IRuleValidationResult {
        if (ref.checkDataType('number')) {
          const value = ref.get();

          const metadata: IStateMetadata = {
            maximum: limit,
            exclusiveMaximum: exclusive,
          };

          if (exclusive ? value >= limit : value > limit) {
            return ref.createErrorResult(
              {
                keyword: keyword.name,
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

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    maximum?: number;
    exclusiveMaximum?: boolean;
  }
}

declare module '../interfaces/IStateMetadata' {
  export default interface IStateMetadata {
    maximum?: number;
    exclusiveMaximum?: boolean;
  }
}
