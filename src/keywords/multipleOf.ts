import Ref from '../Ref';
import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, CompileFn, IRule, IRuleValidationResult,
} from '../types';

const keyword: IKeyword = {
  name: 'multipleOf',
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    const multiplier = schema;

    if (typeof multiplier !== 'number') {
      throw new Error('The schema of the "multipleOf" keyword should be a number.');
    }

    if (multiplier === 0) {
      throw new Error('The "multipleOf" keyword can\'t be zero.');
    }

    return {
      async validate(ref: Ref): Promise<IRuleValidationResult> {
        if (ref.checkDataType('number')) {
          const value = ref.getValue();

          if ((value / multiplier) % 1 !== 0) {
            return ref.createErrorResult(new ValidationMessage(
              keyword.name,
              `Should be multiple of ${multiplier}`,
              { multiplier },
            ));
          }

          return ref.createSuccessResult();
        }

        return ref.createUndefinedResult();
      },
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    multipleOf?: number;
  }
}
