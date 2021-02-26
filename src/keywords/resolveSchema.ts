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

    return async (ref, options, applyValidateFn) => {
      const resolvedSchema = await resolveSchema(schema, ref);
      const validateFn = compile(resolvedSchema, parentSchema);

      return validateFn(ref, options, applyValidateFn);
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    resolveSchema?: SchemaResolver;
  }
}
