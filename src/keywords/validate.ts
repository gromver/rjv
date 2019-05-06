import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule, { ValidateAttributeFn } from '../interfaces/IRule';
import Ref from '../Ref';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';

const keyword: IKeyword = {
  name: 'validate',
  compile(
    compile: CompileFn,
    schema: (ref: Ref, validateAttributeFn: ValidateAttributeFn) => Promise<IRuleValidationResult>,
    parentSchema: ISchema,
  ): IRule {
    if (typeof schema !== 'function') {
      throw new Error(
        'The schema of the "validate" keyword should be an async validation function.',
      );
    }

    return {
      validate(ref: Ref, validateAttributeFn: ValidateAttributeFn): Promise<IRuleValidationResult> {
        return schema(ref, validateAttributeFn);
      },
    };
  },
};

export default keyword;

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    validate?: (ref: Ref, validateAttributeFn: ValidateAttributeFn)
      => Promise<IRuleValidationResult>;
  }
}
