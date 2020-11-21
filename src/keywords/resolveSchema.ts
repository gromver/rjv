import {
  ISchema, IKeyword, CompileFn, IRule, IRef, ValidateRuleFn, RuleValidationResult,
} from '../types';

type SchemaResolver = (ref: IRef) => ISchema | Promise<ISchema>;

async function resolveSchema(schema: SchemaResolver, ref: IRef): Promise<ISchema> {
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
      async validate(ref: IRef, validateRuleFn: ValidateRuleFn, options)
        : Promise<RuleValidationResult> {
        const resolvedSchema = await resolveSchema(schema, ref);
        const rule = compile(resolvedSchema, parentSchema);

        if (rule.validate) {
          return rule.validate(ref, validateRuleFn, options);
        }

        return undefined;
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
