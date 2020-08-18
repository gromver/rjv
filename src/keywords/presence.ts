import Ref from '../Ref';
import ValidationMessage from '../ValidationMessage';
import {
  ISchema, IKeyword, CompileFn, IRule, IRuleValidationResult,
} from '../types';
import utils from '../utils';

interface IPresenceSchema {
  trim: boolean;
}

const keyword: IKeyword = {
  name: 'presence',
  compile(compile: CompileFn, schema: any, parentSchema: ISchema): IRule {
    let presence = false;
    let trim = false;

    if (typeof schema === 'boolean') {
      presence = schema;
    } else if (utils.isObject(schema)) {
      presence = true;
      trim = !!schema.trim;
    } else {
      throw new Error(
        'The schema of the "presence" keyword should be a boolean value or an object.',
      );
    }

    return {
      async validate(ref: Ref): Promise<IRuleValidationResult> {
        if (presence) {
          const value = ref.getValue();

          if (value === undefined) {
            return ref.createErrorResult(
              new ValidationMessage(
                keyword.name,
                'Should not be blank',
                { path: ref.path },
              ),
              { presence },
            );
          }

          if (ref.checkDataType('string')) {
            let stringValue: string = value;

            if (trim) {
              stringValue = (value as string).trim();
              ref.setValue(stringValue);
            }

            if (!stringValue.length) {
              return ref.createErrorResult(
                new ValidationMessage(
                  keyword.name,
                  'Should not be blank',
                  { path: ref.path },
                ),
                { presence },
              );
            }
          }

          return ref.createSuccessResult(undefined, {
            presence,
          });
        }

        return ref.createUndefinedResult({
          presence,
        });
      },
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    presence?: boolean | IPresenceSchema;
  }

  export interface IRuleValidationResult {
    presence?: boolean;
  }
}
