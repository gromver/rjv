import Ref from '../Ref';
import {
  ISchema, IKeyword, CompileFn, IRule, ValidateRuleFn, IRuleValidationResult,
} from '../types';

type SchemaResolver = (ref: Ref) => ISchema | Promise<ISchema>;

async function resolveSchema(schema: SchemaResolver, ref: Ref): Promise<ISchema> {
  return schema(ref);
}

const keyword: IKeyword = {
  name: 'resolveSchema',
  compile(compile: CompileFn, schema: SchemaResolver, parentSchema: ISchema): IRule {
    if (typeof schema !== 'function') {
      throw new Error(
        'The schema of the "resolveSchema" keyword should be a function returns a schema.',
      );
    }

    return {
      async validate(ref: Ref, validateRuleFn: ValidateRuleFn, options)
        : Promise<IRuleValidationResult> {
        const resolvedSchema = await resolveSchema(schema, ref);
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
    resolveSchema?: SchemaResolver;
  }
}
