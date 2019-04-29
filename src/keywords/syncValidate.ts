import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule, { ValidateAttributeFn } from '../interfaces/IRule';
import Ref from '../Ref';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';

const keyword: IKeyword = {
  name: 'syncValidate',
  compile(
    compile: CompileFn,
    schema: (ref: Ref, validateAttributeFn: ValidateAttributeFn) => IRuleValidationResult,
    parentSchema: ISchema,
  ): IRule {
    if (typeof schema !== 'function') {
      throw new Error(
        'The schema of the "syncValidate" keyword should be a sync validation function.',
      );
    }

    return {
      async: false,
      validate(ref: Ref, validateAttributeFn: ValidateAttributeFn): IRuleValidationResult {
        return schema(ref, validateAttributeFn);
      },
    };
  },
};

export default keyword;

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    syncValidate?: (ref: Ref, validateAttributeFn: ValidateAttributeFn) => IRuleValidationResult;
  }
}
