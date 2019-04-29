import Ref from '../Ref';
import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule from '../interfaces/IRule';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
import IStateMetadata from '../interfaces/IStateMetadata';

const keyword: IKeyword = {
  name: 'maxItems',
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    const limit = schema;

    if (typeof limit !== 'number') {
      throw new Error('The schema of the "maxItems" keyword should be a number.');
    }

    if (limit < 0) {
      throw new Error('The "maxItems" keyword can\'t be less then 0.');
    }

    return {
      validate(ref: Ref): IRuleValidationResult {
        if (ref.checkDataType('array')) {
          const value = ref.get();

          const metadata: IStateMetadata = {
            maxItems: limit,
          };

          if (value.length > limit) {
            return ref.createErrorResult(
              {
                keyword: keyword.name,
                description: `Should not have more than ${limit} items`,
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

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    maxItems?: number;
  }
}

declare module '../interfaces/IStateMetadata' {
  export default interface IStateMetadata {
    maxItems?: number;
  }
}
