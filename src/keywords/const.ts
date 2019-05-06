import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule from '../interfaces/IRule';
import Ref from '../Ref';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';

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
        const value = ref.get();
        const allowedValue = resolve(ref);

        return _.isEqual(value, allowedValue)
          ? ref.createSuccessResult()
          : ref.createErrorResult({
            keyword: keyword.name,
            description: 'Should be equal to constant',
            bindings: { allowedValue },
          });
      },
    };
  },
};

export default keyword;

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    const?: any | ((ref: Ref) => any);
  }
}
