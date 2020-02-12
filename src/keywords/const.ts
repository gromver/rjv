import Ref from '../Ref';
import {
  ISchema, IKeyword, CompileFn, IRule, IRuleValidationResult,
} from '../types';

const _ = {
  isEqual: require('lodash/isEqual'),
};

const keyword: IKeyword = {
  name: 'const',
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    let resolve: (ref: Ref) => any;

    if (typeof schema === 'function') {
      resolve = schema;
    } else {
      resolve = () => schema;
    }

    return {
      async validate(ref: Ref): Promise<IRuleValidationResult> {
        const value = ref.getValue();
        const allowedValue = resolve(ref);

        const metadata: IRuleValidationResult = {
          const: allowedValue,
        };

        return _.isEqual(value, allowedValue)
          ? ref.createSuccessResult(undefined, metadata)
          : ref.createErrorResult(
            {
              keyword: keyword.name,
              description: 'Should be equal to constant',
              bindings: { allowedValue },
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
    const?: any | ((ref: Ref) => any);
  }

  export interface IRuleValidationResult {
    const?: any;
  }
}
