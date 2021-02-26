import ValidateFnResult from '../ValidateFnResult';
import { IKeyword } from '../types';
import utils from '../utils';

const keyword: IKeyword = {
  name: 'maxLength',
  compile(compile, schema: any) {
    const limit = schema;

    if (typeof limit !== 'number') {
      throw new Error('The schema of the "maxLength" keyword should be a number.');
    }

    if (limit < 0) {
      throw new Error('The "maxLength" keyword can\'t be less then 0.');
    }

    return async (ref) => {
      const value = ref.value;

      if (utils.checkDataType('string', value)) {
        if (value.length > limit) {
          return new ValidateFnResult(
            false,
            'Should not be longer than {limit} characters',
            keyword.name,
            { limit },
          );
        }

        return new ValidateFnResult(true);
      }

      return undefined;
    };
  },
};

export default keyword;

declare module '../types' {
  export interface ISchema {
    maxLength?: number;
  }

  export interface ICustomErrors {
    maxLength?: string;
  }
}
