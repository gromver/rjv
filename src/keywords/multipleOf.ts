import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule from '../interfaces/IRule';
import Ref from '../Ref';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';

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
      validate(ref: Ref): IRuleValidationResult {
        if (ref.checkDataType('number')) {
          const value = ref.get();

          if ((value / multiplier) % 1 !== 0) {
            return ref.createErrorResult({
              keyword: keyword.name,
              description: `Should be multiple of ${multiplier}`,
              bindings: { multiplier },
            });
          }

          return ref.createSuccessResult();
        }

        return ref.createUndefinedResult();
      },
    };
  },
};

export default keyword;

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    multipleOf?: number;
  }
}
