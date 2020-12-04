import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, ValidateFn, ApplyValidateFn, ValidateFnResult,
} from '../types';
import utils from '../utils';

const silentValidateFn: ApplyValidateFn = async (ref, validateFn) => {
  return validateFn(
    ref,
    {
      coerceTypes: false,
      removeAdditional: false,
    },
    silentValidateFn,
  );
};

const keyword: IKeyword = {
  name: 'oneOf',
  compile(compile, schema: ISchema[], parentSchema) {
    if (!Array.isArray(schema)) {
      throw new Error('The schema of the "oneOf" keyword should be an array of schemas.');
    }

    const rules: ValidateFn[] = [];

    schema.forEach((item) => {
      if (!utils.isObject(item)) {
        throw new Error('Items of "oneOf" keyword should be a schema object.');
      }

      rules.push(compile(item, parentSchema));
    });

    return (ref, options, applyValidateFn) => {
      const jobs: Promise<ValidateFnResult>[] = rules
        .map(
          (rule) => rule(
            ref,
            {
              coerceTypes: false,
              removeAdditional: false,
            },
            silentValidateFn,
          ),
        );

      return Promise.all(jobs).then((results) => {
        const validRules: ValidateFn[] = [];

        results.forEach((result, index) => {
          if (result && result.valid) {
            validRules.push(rules[index]);
          }
        });

        if (validRules.length === 1) {
          return applyValidateFn(ref, validRules[0], options);
        }

        return utils.createErrorResult(new ValidationMessage(
          false,
          keyword.name,
          'Should match exactly one schema in oneOf',
        ));
      });
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    oneOf?: ISchema[];
  }
}
