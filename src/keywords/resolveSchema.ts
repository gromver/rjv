import { ISchema, IKeyword, IRef } from '../types';

type SchemaResolver = (ref: IRef) => ISchema | Promise<ISchema>;

async function resolveSchema(schema: SchemaResolver, ref: IRef): Promise<ISchema> {
  return schema(ref);
}

const keyword: IKeyword = {
  name: 'resolveSchema',
  compile(compile, schema: SchemaResolver, parentSchema) {
    if (typeof schema !== 'function') {
      throw new Error(
        'The schema of the "resolveSchema" keyword should be a function returns a schema.',
      );
    }

    return {
      async validate(ref, options, validateRuleFn) {
        const resolvedSchema = await resolveSchema(schema, ref);
        const rule = compile(resolvedSchema, parentSchema);

        if (rule.validate) {
          return rule.validate(ref, options, validateRuleFn);
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
