import Ref from '../Ref';
import {
  ISchema, IKeyword, CompileFn, IRule, IRuleValidationResult,
} from '../types';

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
      async validate(ref: Ref): Promise<IRuleValidationResult> {
        const value = ref.getValue();
        const valid = allowedValues.some((item) => _.isEqual(value, item));

        const metadata: IRuleValidationResult = {
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

declare module '../types' {
  export interface ISchema {
    enum?: any[];
  }

  export interface IRuleValidationResult {
    enum?: any[];
  }
}
