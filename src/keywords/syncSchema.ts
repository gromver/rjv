import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule, { ValidateAttributeFn } from '../interfaces/IRule';
import Ref from '../Ref';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';

const keyword: IKeyword = {
  name: 'syncSchema',
  compile(compile: CompileFn, schema: (ref: Ref) => ISchema, parentSchema: ISchema): IRule {
    if (typeof schema !== 'function') {
      throw new Error(
        'The schema of the "syncSchema" keyword should be a function returns a schema.',
      );
    }

    return {
      async: false,
      validate(ref: Ref, validateAttributeFn: ValidateAttributeFn): IRuleValidationResult {
        const resolvedSchema = schema(ref);
        const rule = compile(resolvedSchema, parentSchema);

        if (rule.async) {
          throw new Error('The syncSchema\'s schema can\'t be async.');
        }

        if (rule.validate) {
          return rule.validate(ref, validateAttributeFn) as IRuleValidationResult;
        }

        return ref.createUndefinedResult();
      },
    };
  },
};

export default keyword;

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    syncSchema?: (ref: Ref) => ISchema;
  }
}
