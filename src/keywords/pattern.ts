import Ref from '../Ref';
import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule from '../interfaces/IRule';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
import IStateMetadata from '../interfaces/IStateMetadata';

const keyword: IKeyword = {
  name: 'pattern',
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    if (typeof schema !== 'string') {
      throw new Error('The schema of the "pattern" keyword should be a string.');
    }

    const regexp = new RegExp(schema);

    return {
      validate(ref: Ref): IRuleValidationResult {
        if (ref.checkDataType('string')) {
          const value = ref.get();

          const metadata: IStateMetadata = {
            pattern: schema,
          };

          if (!regexp.test(value)) {
            return ref.createErrorResult(
              {
                keyword: keyword.name,
                description: `Should match pattern ${schema}`,
                bindings: { pattern: schema },
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
    pattern?: string;
  }
}

declare module '../interfaces/IStateMetadata' {
  export default interface IStateMetadata {
    pattern?: string;
  }
}
