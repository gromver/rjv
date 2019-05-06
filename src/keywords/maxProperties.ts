import Ref from '../Ref';
import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule from '../interfaces/IRule';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
import IStateMetadata from '../interfaces/IStateMetadata';

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
          const value = ref.get();

          const metadata: IStateMetadata = {
            maxProperties: limit,
          };

          if (Object.values(value).length > limit) {
            return ref.createErrorResult(
              {
                keyword: keyword.name,
                description: `Should not have more than ${limit} properties`,
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
    maxProperties?: number;
  }
}

declare module '../interfaces/IStateMetadata' {
  export default interface IStateMetadata {
    maxProperties?: number;
  }
}
