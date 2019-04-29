import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule from '../interfaces/IRule';
import Ref from '../Ref';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
import IStateMetadata from '../interfaces/IStateMetadata';

const _ = {
  isEqual: require('lodash/isEqual'),
};

const keyword: IKeyword = {
  name: 'enum',
  compile(compile: CompileFn, schema: any[], parentSchema: ISchema): IRule {
    const allowedValues = schema;

    if (!Array.isArray(allowedValues)) {
      throw new Error('The schema of the "enum" keyword should be an array.');
    }

    return {
      validate(ref: Ref): IRuleValidationResult {
        const value = ref.get();
        const valid = allowedValues.some((item) => _.isEqual(value, item));

        const metadata: IStateMetadata = {
          enum: allowedValues,
        };

        return valid
          ? ref.createSuccessResult(undefined, metadata)
          : ref.createErrorResult(
            {
              keyword: keyword.name,
              description: 'Should be equal to one of the allowed values',
              bindings: { allowedValues },
            },
            metadata,
          );
      },
    };
  },
};

export default keyword;

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    enum?: any[];
  }
}

declare module '../interfaces/IStateMetadata' {
  export default interface IStateMetadata {
    enum?: any[];
  }
}
