import ValidationMessage from '../ValidationMessage';
import { IKeyword } from '../types';
import utils from '../utils';

interface IPresenceSchema {
  trim: boolean;
}

const keyword: IKeyword = {
  name: 'presence',
  compile(compile, schema: any) {
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

    return async (ref) => {
      if (presence) {
        const value = ref.value;

        if (value === undefined) {
          return utils.createErrorResult(
            new ValidationMessage(
              false,
              keyword.name,
              'Should not be blank',
              { path: ref.path },
            ),
          );
        }

        if (utils.checkDataType('string', ref.value)) {
          let stringValue: string = value;

          if (trim) {
            stringValue = (value as string).trim();
            ref.value = stringValue;
          }

          if (!stringValue.length) {
            return utils.createErrorResult(
              new ValidationMessage(
                false,
                keyword.name,
                'Should not be blank',
                { path: ref.path },
              ),
            );
          }
        }

        return utils.createSuccessResult();
      }

      return undefined;
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    presence?: boolean | IPresenceSchema;
  }
}
