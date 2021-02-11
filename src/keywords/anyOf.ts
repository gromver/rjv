import ValidateFnResult from '../ValidateFnResult';
import {
  ISchema, IKeyword, ValidateFn, IRef, ApplyValidateFn,
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

async function findValidSchemaRule(rules: ValidateFn[], ref: IRef) {
  for (let i = 0; i < rules.length; i += 1) {
    const rule = rules[i] as any;

    const result = await rule(
      ref,
      {
        coerceTypes: false,
        removeAdditional: false,
      },
      silentValidateFn,
    );

    if (result.valid === true) {
      return rule;
    }
  }
}

const keyword: IKeyword = {
  name: 'anyOf',
  compile(compile, schema: ISchema[], parentSchema) {
    if (!Array.isArray(schema)) {
      throw new Error('The schema of the "anyOf" keyword should be an array of schemas.');
    }

    const rules: ValidateFn[] = [];

    schema.forEach((item) => {
      if (!utils.isObject(item)) {
        throw new Error('Items of "anyOf" keyword should be a schema object.');
      }

      rules.push(compile(item, parentSchema));
    });

    return (ref, options, applyValidateFn) => {
      return findValidSchemaRule(rules, ref)
        .then((rule) => {
          if (rule) {
            return applyValidateFn(ref, rule, options);
          }

          return new ValidateFnResult(
            false,
            'Should match some schema in anyOf',
            keyword.name,
          );
        });
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    anyOf?: ISchema[];
  }

  export interface ICustomErrors {
    anyOf?: string;
  }
}
