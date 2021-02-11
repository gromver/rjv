import ValidateFnResult from '../ValidateFnResult';
import {
  ISchema, IKeyword, ValidateFn, KeywordFnValidationResult,
} from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'allOf',
  compile(compile, schema: ISchema[], parentSchema) {
    if (!Array.isArray(schema)) {
      throw new Error('The schema of the "allOf" keyword should be an array of schemas.');
    }

    const rules: ValidateFn[] = [];

    schema.forEach((item) => {
      if (!utils.isObject(item)) {
        throw new Error('Items of "allOf" keyword should be a schema object.');
      }

      rules.push(compile(item, parentSchema));
    });

    return async (ref, options, applyValidateFn) => {
      const results: (KeywordFnValidationResult)[] = [];

      for (const rule of rules) {
        const res = await applyValidateFn(ref, rule, options);
        results.push(res);
      }

      const validRules = results.filter((result) => result && result.valid).length;

      if (validRules === results.length) {
        return new ValidateFnResult(true);
      }

      return new ValidateFnResult(
        false,
        'Should match all schema in allOf',
        keyword.name,
      );
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    allOf?: ISchema[];
  }

  export interface ICustomErrors {
    allOf?: string;
  }
}
