import Ref from '../Ref';
import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule from '../interfaces/IRule';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
import IStateMetadata from '../interfaces/IStateMetadata';

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
      validate(ref: Ref): IRuleValidationResult {
        if (ref.checkDataType('string')) {
          const value = ref.get();

          const metadata: IStateMetadata = {
            minLength: limit,
          };

          if (value.length < limit) {
            return ref.createErrorResult(
              {
                keyword: keyword.name,
                description: `Should not be shorter than ${limit} characters`,
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
    minLength?: number;
  }
}

declare module '../interfaces/IStateMetadata' {
  export default interface IStateMetadata {
    minLength?: number;
  }
}
