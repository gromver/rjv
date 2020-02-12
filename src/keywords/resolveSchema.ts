import Ref from '../Ref';
import {
  ISchema, IKeyword, CompileFn, IRule, ValidateRuleFn, IRuleValidationResult,
} from '../types';

const keyword: IKeyword = {
  name: 'resolveSchema',
  compile(compile: CompileFn, schema: (ref: Ref) => ISchema, parentSchema: ISchema): IRule {
    if (typeof schema !== 'function') {
      throw new Error(
        'The schema of the "resolveSchema" keyword should be a function returns a schema.',
      );
    }

    return {
      async validate(ref: Ref, validateRuleFn: ValidateRuleFn, options)
        : Promise<IRuleValidationResult> {
        const resolvedSchema = await schema(ref);
        const rule = compile(resolvedSchema, parentSchema);

        if (rule.validate) {
          return rule.validate(ref, validateRuleFn, options);
        }

        return Promise.resolve(ref.createUndefinedResult());
      },
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    resolveSchema?: (ref: Ref) => Promise<ISchema>;
  }
}
