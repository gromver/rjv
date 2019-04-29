import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule, { ValidateAttributeFn } from '../interfaces/IRule';
import Ref from '../Ref';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';

const keyword: IKeyword = {
  name: 'asyncSchema',
  compile(compile: CompileFn, schema: (ref: Ref) => ISchema, parentSchema: ISchema): IRule {
    if (typeof schema !== 'function') {
      throw new Error(
        'The schema of the "asyncSchema" keyword should be a function returns a schema.',
      );
    }

    return {
      async: true,
      async validate(ref: Ref, validateAttributeFn: ValidateAttributeFn)
        : Promise<IRuleValidationResult> {
        const resolvedSchema = await schema(ref);
        const rule = compile(resolvedSchema, parentSchema);

        if (rule.validate) {
          return rule.async
            ? rule.validate(ref, validateAttributeFn) as Promise<IRuleValidationResult>
            : Promise.resolve(rule.validate(ref, validateAttributeFn) as IRuleValidationResult);
        }

        return Promise.resolve(ref.createUndefinedResult());
      },
    };
  },
};

export default keyword;

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    asyncSchema?: (ref: Ref) => Promise<ISchema>;
  }
}
