import ISchema from '../interfaces/ISchema';
import IKeyword, { CompileFn } from '../interfaces/IKeyword';
import IRule from '../interfaces/IRule';
import Ref from '../Ref';
import IRuleValidationResult from '../interfaces/IRuleValidationResult';
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
        if (presence && ref.checkDataType('string')) {
          let value = ref.value as string;

          if (trim) {
            ref.value = value = value.trim();
          }

          if (!value.length) {
            return ref.createErrorResult(
              {
                keyword: keyword.name,
                description: 'Should not be blank',
                bindings: { path: ref.path },
              },
              {
                presence,
              },
            );
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

declare module '../interfaces/ISchema' {
  export default interface ISchema {
    presence?: boolean | IPresenceSchema;
  }
}

declare module '../interfaces/IStateMetadata' {
  export default interface IStateMetadata {
    presence?: boolean;
  }
}
