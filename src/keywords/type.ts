import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule from '../interfaces/IRule';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
import Ref, { DataType } from '../Ref';

const keyword: IKeyword = {
  name: 'type',
  reserveNames: ['coerceType'], // todo
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    // Type can be: number, integer, string, boolean, array, object or null.
    let types: DataType[] = [];
    const data = schema.data ? schema.data : schema;

    if (typeof data === 'string') {
      types = [data as DataType];
    } else if (Array.isArray(data)) {
      types = data;
    }

    return {
      validate(ref: Ref): IRuleValidationResult {
        if (ref.get() === undefined) {
          return ref.createUndefinedResult();
        }

        const valid = types.some((type) => ref.checkDataType(type));

        return valid
          ? ref.createSuccessResult()
          : ref.createErrorResult({
            keyword: keyword.name,
            description: `Should be ${types.join(', ')}`,
            bindings: { types },
          });
      },
    };
  },
};

export default keyword;

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    type?: string | string[];
  }
}
