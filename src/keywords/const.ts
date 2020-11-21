import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, CompileFn, IRule, IRef, RuleValidationResult,
} from '../types';
import utils from '../utils';

const _ = {
  isEqual: require('lodash/isEqual'),
};

const keyword: IKeyword = {
  name: 'const',
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    let resolve: (ref: IRef) => any;

    if (typeof schema === 'function') {
      resolve = schema;
    } else {
      resolve = () => schema;
    }

    return {
      async validate(ref: IRef): Promise<RuleValidationResult> {
        const value = ref.value;
        const allowedValue = resolve(ref);

        return _.isEqual(value, allowedValue)
          ? utils.createSuccessResult()
          : utils.createErrorResult(
            new ValidationMessage(
              false,
              keyword.name,
              'Should be equal to constant',
              { allowedValue },
            ),
          );
      },
    };
  },
};

export default keyword;

type ConstValue = number | string | null | {} | [];

declare module '../types' {
  export interface ISchema {
    const?: ((ref: IRef) => ConstValue) | ConstValue;
  }
}
